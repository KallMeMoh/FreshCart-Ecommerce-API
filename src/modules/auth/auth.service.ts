import { compare, hash } from 'bcrypt';
import { randomBytes, randomInt, randomUUID } from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OAuth2Client } from 'google-auth-library';
import { Types } from 'mongoose';
import { ConfigService } from '../config/config.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '../token/jwt.service';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { UsersRepository } from '../user/user.repository';
import { AuthRepository } from './auth.repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthProviderEnum } from './enums/auth-provider.enum';
import type { RUser } from '../../types/express';

@Injectable()
export class AuthService {
  googleClient = new OAuth2Client();

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private generateTokens(userId: string, role: UserRoleEnum, jwtid?: string) {
    const jti = jwtid ?? randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: userId, role, jti },
      {
        // note to self: explicitness is superior than implicitness
        secret: this.configService.accessSecret,
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, role, jti },
      {
        secret: this.configService.refreshSecret,
        expiresIn: '1y',
      },
    );

    return {
      requires2FA: false,
      pendingToken: null,
      accessToken,
      refreshToken,
    };
  }

  async signup({ username, email, password }: SignupDto) {
    const userExists = await this.usersRepository.existsByEmail(email);
    if (userExists) throw new ConflictException('Email already in use');

    const hashedPassword = await hash(password, this.configService.saltRounds);

    const user = await this.usersRepository.create({
      username,
      email,
      avatarKey: null,
      verified: false,
      has2FA: false,
      hashedPassword,

      provider: AuthProviderEnum.System,
      role: UserRoleEnum.User,
      verificationExpiry: new Date(),
    });

    const token = randomBytes(32).toString('hex');
    await this.usersRepository.setVerificationToken(user._id.toString(), token);

    this.mailService
      .sendVerificationEmail(
        user.email,
        `${this.configService.frontendUrl}/verify/${token}`,
      )
      .catch((err: unknown) => console.error('Failed to email OTP: ', err));
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new NotFoundException('Account does not exist');

    if (user.provider !== AuthProviderEnum.System)
      throw new BadRequestException(
        'This account uses Google sign-in. Please continue with Google.',
      );

    const loginAttempts = await this.authRepository.getLoginAttempts(
      user._id.toString(),
    );
    if (loginAttempts && parseInt(loginAttempts) > 5)
      throw new NotFoundException(
        'Account temporarily banned, try again later',
      );

    const matchedPassword = await compare(password, user.hashedPassword!);
    if (!matchedPassword) {
      await this.authRepository.incrementLoginAttempts(user._id.toString());
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.has2FA) {
      const pendingToken = this.jwtService.sign(
        { sub: user._id },
        {
          secret: this.configService.pendingAuthSecret,
          expiresIn: '10m',
        },
      );

      const code = randomInt(100_000, 999_999).toString();
      await this.authRepository.store2FACode(user._id.toString(), code);
      await this.mailService.send2FAEmail(user.email, code);

      return {
        requires2FA: true,
        pendingToken,
        accessToken: null,
        refreshToken: null,
      };
    }

    return this.generateTokens(user._id.toString(), user.role);
  }

  async completeLogin(user: RUser, otp: string) {
    const code = await this.authRepository.get2FACode(user.id);

    if (!code) throw new NotFoundException('OTP Expired, please login again');

    const loginAttempts = await this.authRepository.getLoginAttempts(user.id);
    if (loginAttempts && parseInt(loginAttempts) > 5)
      throw new UnauthorizedException(
        'Account temporarily banned, try again later',
      );

    if (otp !== code) {
      await this.authRepository.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.role);
  }

  async googleSignup(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestException();
    const { given_name, email, picture, email_verified } = payload;

    const user = await this.usersRepository.findByEmail(email ?? '');
    if (user) throw new ConflictException('Account already exists');

    await this.usersRepository.create({
      username: given_name!,
      email: email!,
      verified: email_verified ?? false,
      avatarKey: picture ?? null,
      provider: AuthProviderEnum.Google,
      has2FA: false,
      role: UserRoleEnum.User,
    });
  }

  async googleLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.configService.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestException();

    const user = await this.usersRepository.findByEmailAndProvider(
      payload.email ?? '',
      AuthProviderEnum.Google,
    );

    if (!user) throw new UnauthorizedException();

    if (user.provider !== AuthProviderEnum.Google)
      throw new BadRequestException(
        'This account uses password sign-in. Please log in with your password.',
      );

    return this.generateTokens(user._id.toString(), user.role);
  }

  rotateToken(user: RUser) {
    const { accessToken: newAccessToken } = this.generateTokens(
      user.id,
      user.role,
      user.tokenId,
    );
    return newAccessToken;
  }

  async resetPassword({ email }: ForgotPasswordDto) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) return;

    const token = randomBytes(32).toString('hex');
    await this.authRepository.setPasswordResetToken(token, user._id.toString());
    await this.mailService.sendPasswordResetEmail(
      user.email,
      `${this.configService.frontendUrl}/forget-password/${token}`,
    );
  }

  async verifyResetPassword(token: string, { new_password }: ResetPasswordDto) {
    const userId =
      (await this.authRepository.getPasswordResetToken(token)) ?? '';

    if (!Types.ObjectId.isValid(userId))
      throw new NotFoundException('Invalid or expired reset token');

    const hashedPassword = await hash(
      new_password,
      this.configService.saltRounds,
    );
    await this.usersRepository.updatePassword(userId, hashedPassword);
  }

  async blacklistToken(jti: string) {
    await this.authRepository.blacklistToken(jti);
  }

  // note to self: AuthModule deeply depends on UserModule while
  // UserModule depending on AuthModule is just a side-effect
  // it is better to set up this "something happened, react to it"
  // than to use forwardRef();
  // Auth subscribes to these 2 events and blacklists the token.
  @OnEvent('user.deleted')
  @OnEvent('user.password-changed')
  async handleTokenInvalidation(payload: { jti: string }) {
    await this.blacklistToken(payload.jti);
  }
}
