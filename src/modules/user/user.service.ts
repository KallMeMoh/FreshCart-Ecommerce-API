import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { compare, hash } from 'bcrypt';
import { randomBytes, randomInt } from 'node:crypto';
import { AuthProviderEnum } from '../auth/enums/auth-provider.enum';
import { ConfigService } from '../config/config.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOne(userId: string) {
    const user = await this.usersRepository.findById(
      userId,
      '-password -provider -updatedAt -__v',
    );
    if (user === null) throw new NotFoundException("User doesn't exist");
    return user;
  }

  async request2FAActivation(userId: string, tokenId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.eventEmitter.emit('user.deleted', { tokenId });
      throw new NotFoundException("Account doesn't exist");
    }

    if (user.verified) throw new ConflictException('Account already verified');

    const codeExists =
      await this.usersRepository.twoFAActivationCodeExists(userId);
    if (codeExists)
      throw new HttpException(
        'A code was already sent, please wait before requesting a new one',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const code = String(randomInt(100000, 999999));
    await this.usersRepository.set2FAActivationCode(user._id.toString(), code);

    return { email: user.email, code };
  }

  async activate2FA(userId: string, tokenId: string, code: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.eventEmitter.emit('user.deleted', { tokenId });
      throw new NotFoundException("Account doesn't exist");
    }

    if (user.verified) throw new ConflictException('Account already verified');

    const otp = await this.usersRepository.get2FAActivationCode(
      user._id.toString(),
    );
    if (!otp)
      throw new NotFoundException('Code expired, please request a new one');
    if (otp !== code)
      throw new UnauthorizedException('Invalid Code, please try again later');

    await Promise.all([
      this.usersRepository.del2FAActivationCode(user._id.toString()),
      this.usersRepository.updateById(user._id.toString(), {
        $set: { has2FA: true },
      }),
    ]);
  }

  async requestVerificationCode(userId: string, tokenId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.eventEmitter.emit('user.deleted', { tokenId });
      throw new NotFoundException("Account doesn't exist");
    }

    if (user.verified) throw new ConflictException('Account already verified');

    const otpExists = await this.usersRepository.verificationCodeExists(
      user._id.toString(),
    );
    if (otpExists)
      throw new HttpException(
        'A link was already sent, please wait before requesting a new one',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const token = randomBytes(32).toString('hex');
    await this.usersRepository.setVerificationToken(user._id.toString(), token);

    return { email: user.email, token };
  }

  async verifyUserAccount(userId: string, tokenId: string, token: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.eventEmitter.emit('user.deleted', { tokenId });
      throw new NotFoundException("Account doesn't exist");
    }
    if (user.verified) throw new ConflictException('Account already verified');

    const storedToken = await this.usersRepository.getVerificationToken(
      user._id.toString(),
    );

    if (storedToken !== token)
      throw new NotFoundException('Link expired, please request a new one');

    await Promise.all([
      this.usersRepository.delVerificationCode(user._id.toString()),
      this.usersRepository.updateById(user._id.toString(), {
        $set: { verified: true },
        $unset: { verificationExpiry: 1 },
      }),
    ]);
  }

  async updateOne(userId: string, { username, email }: UpdateUserDto) {
    const user = await this.usersRepository.updateById(
      userId,
      { $set: { ...(username && { username }), ...(email && { email }) } },
      {
        returnDocument: 'after',
        projection: '-password -provider -updatedAt -__v',
      },
    );
    if (!user) throw new NotFoundException("User doesn't exist");
    return user;
  }

  async updateUserPassword(
    userId: string,
    jti: string,
    { old_password, new_password }: UpdatePasswordDto,
  ) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      this.eventEmitter.emit('user.deleted', { tokenId: jti });
      throw new NotFoundException("Account doesn't exist");
    }

    if (user.provider === AuthProviderEnum.Google) return;

    const passwordsMatch = await compare(old_password, user.hashedPassword!);
    if (!passwordsMatch) throw new UnauthorizedException('Invalid credentials');

    const newHashedPassword = await hash(
      new_password,
      this.configService.saltRounds,
    );

    await this.usersRepository.updatePassword(
      user._id.toString(),
      newHashedPassword,
    );

    this.eventEmitter.emit('user.password-changed', { jti });
  }

  async delete(userId: string, tokenId: string) {
    const { deletedCount } = await this.usersRepository.deleteById(userId);
    if (deletedCount < 1) throw new NotFoundException('Account does not exist');

    this.eventEmitter.emit('user.deleted', { tokenId });
  }
}
