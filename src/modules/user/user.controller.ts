import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ExtractUser } from '../../common/decorators/extract-user';
import { AllowedPictureMimeType } from '../../common/enums/picture-mimetype.enum';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { R2BucketService } from '../bucket/bucket.service';
import { MailService } from '../mail/mail.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './user.service';
import { ParseVerificationUrlPipe } from '../../common/pipes/parse-verification-url.pipe';
import type { RUser } from '../../types/express';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly r2BucketService: R2BucketService,
    private readonly mailService: MailService,
  ) {}

  @Get(':id')
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
  async enable2FA(@ExtractUser() user: RUser) {
    const { email, code } = await this.usersService.request2FAActivation(
      user.id,
      user.tokenId,
    );
    await this.mailService.send2FAEmail(email, code);
    return { message: 'Please check your inbox' };
  }

  @Post('2fa/verify')
  async verify2FA(@ExtractUser() user: RUser, @Body() otp: string) {
    await this.usersService.activate2FA(user.id, user.tokenId, otp);
    return { message: 'Account has been verified successfully' };
  }

  @Post('verification/resend')
  async reRequestVerification(
    @ExtractUser() user: RUser,
    @Body('verificationRedirectUrl', ParseVerificationUrlPipe)
    verificationRedirectUrl: string,
  ) {
    const { email, token } = await this.usersService.requestVerificationCode(
      user.id,
      user.tokenId,
    );

    await this.mailService.sendVerificationEmail(
      email,
      `${verificationRedirectUrl}/${token}`,
    );

    return { message: 'A verification link has been sent to your inbox' };
  }

  @Post('verify')
  async completeVerification(
    @ExtractUser() user: RUser,
    @Body('token') token: string,
  ) {
    await this.usersService.verifyUserAccount(user.id, user.tokenId, token);
    return { message: 'Account has been verified successfully' };
  }

  @Post('update-password')
  async updatePassword(
    @ExtractUser() user: RUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updateUserPassword(
      user.id,
      user.tokenId,
      updatePasswordDto,
    );
    return { message: 'Password updated successfully' };
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateOne(id, updateUserDto);
  }

  @HttpCode(204)
  @Delete(':id')
  deleteAccount(@ExtractUser() user: RUser) {
    return this.usersService.delete(user.id, user.tokenId);
  }
}
