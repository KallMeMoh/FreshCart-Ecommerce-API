import { randomUUID } from 'node:crypto';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseEnumPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExtractUser } from '../../common/decorators/extract-user';
import { User } from './entities/user.entity';
import { R2BucketService } from '../bucket/bucket.service';
import { ExtractTokenId } from '../../common/decorators/extract-token-id';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { MailService } from '../mail/mail.service';
import { AllowedPictureMimeType } from '../../common/enums/picture-mimetype.enum';
import { AccessTokenGuard } from '../../common/guards/access-toke.guard';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly r2BucketService: R2BucketService,
    private readonly mailService: MailService,
  ) {}

  @Get('id')
  async getProfile(@Param('id') id: string) {
    const { avatarKey, ...user } = await this.usersService.findOne(id);
    const avatar = avatarKey
      ? this.r2BucketService.generateReadUrl(avatarKey)
      : null;
    return { ...user, avatar };
  }

  @Get('avatar-upload-url')
  getAvatarUploadUrl(
    @Query('mimetype', new ParseEnumPipe(AllowedPictureMimeType))
    mimetype: AllowedPictureMimeType,
  ) {
    const extension = mimetype.split('/')[1];
    const key = `avatars/${Date.now()}_${randomUUID()}.${extension}`;
    return this.r2BucketService.generateUploadUrl(key, mimetype);
  }

  @Post('2fa/enable')
  async enable2FA(@ExtractUser() user: User) {
    const code = await this.usersService.request2FAActivation(user);
    await this.mailService.send2FAEmail(user.email, code);
    return { message: 'Please check your inbox' };
  }

  @Post('2fa/verify')
  async verify2FA(@ExtractUser() user: User, @Body() otp: string) {
    await this.usersService.activate2FA(user, otp);
    return { message: 'Account has been verified successfully' };
  }

  @Post('verification/resend')
  async reRequestVerification(@ExtractUser() user: User) {
    const code = await this.usersService.requestVerificationCode(user);
    await this.mailService.send2FAEmail(user.email, code);
    return { message: 'OTP code emailed successfully' };
  }

  @Post('verify')
  async completeVerification(@ExtractUser() user: User, @Body() otp: string) {
    await this.usersService.verifyUserAccount(user, otp);
    return { message: 'Account has been verified successfully' };
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateOne(id, updateUserDto);
  }

  @Post('update-password')
  async updatePassword(
    @ExtractUser() user: User,
    @ExtractTokenId() tokenId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updateUserPassword(
      user,
      tokenId,
      updatePasswordDto,
    );
    return { message: 'Password updated successfully' };
  }

  @HttpCode(204)
  @Delete(':id')
  deleteAccount(@ExtractUser() user: User, @ExtractTokenId() tokenId: string) {
    return this.usersService.delete(user._id.toString(), tokenId);
  }
}
