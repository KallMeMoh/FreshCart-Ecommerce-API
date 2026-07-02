import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { randomInt } from 'node:crypto';
import { AuthProviderEnum } from '../auth/enums/auth-provider.enum';
import { ConfigService } from '../config/config.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  async request2FAActivation(user: User) {
    if (user.verified) throw new ConflictException('Account already verified');

    const codeExists = await this.usersRepository.twoFAActivationCodeExists(
      user._id.toString(),
    );
    if (codeExists)
      throw new HttpException(
        'A code was already sent, please wait before requesting a new one',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const code = String(randomInt(100000, 999999));
    await this.usersRepository.set2FAActivationCode(user._id.toString(), code);

    return code;
  }

  async activate2FA(user: User, code: string) {
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

  async requestVerificationCode(user: User) {
    if (user.verified) throw new ConflictException('Account already verified');

    const otpExists = await this.usersRepository.verificationCodeExists(
      user._id.toString(),
    );
    if (otpExists)
      throw new HttpException(
        'A code was already sent, please wait before requesting a new one',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const code = String(randomInt(100000, 999999));
    await this.usersRepository.setVerificationCode(user._id.toString(), code);

    return code;
  }

  async verifyUserAccount(user: User, code: string) {
    if (user.verified) throw new ConflictException('Account already verified');

    const otp = await this.usersRepository.getVerificationCode(
      user._id.toString(),
    );

    if (!otp)
      throw new NotFoundException('Code expired, please request a new one');
    if (otp !== code)
      throw new UnauthorizedException('Invalid code, please try again');

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
    user: User,
    jti: string,
    { old_password, new_password }: UpdatePasswordDto,
  ) {
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
