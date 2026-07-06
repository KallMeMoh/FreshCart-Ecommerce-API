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
import { ExtractTokenId } from '../../common/decorators/extract-token-id';
import { ExtractUser } from '../../common/decorators/extract-user';
import { AllowedPictureMimeType } from '../../common/enums/picture-mimetype.enum';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { R2BucketService } from '../bucket/bucket.service';
import { MailService } from '../mail/mail.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './user.service';
import { ParseVerificationUrlPipe } from '../../common/pipes/parse-verification-url.pipe';

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
  async enable2FA(
    @ExtractUser() user: { userId: string },
    @ExtractTokenId() tokenId: string,
  ) {
    const { email, code } = await this.usersService.request2FAActivation(
      user.userId,
      tokenId,
    );
    await this.mailService.send2FAEmail(email, code);
    return { message: 'Please check your inbox' };
  }

  @Post('2fa/verify')
  async verify2FA(
    @ExtractUser() user: { userId: string },
    @ExtractTokenId() tokenId: string,
    @Body() otp: string,
  ) {
    await this.usersService.activate2FA(user.userId, tokenId, otp);
    return { message: 'Account has been verified successfully' };
  }

  @Post('verification/resend')
  async reRequestVerification(
    @ExtractUser() user: { userId: string },
    @ExtractTokenId() tokenId: string,
    @Body('verificationRedirectUrl', ParseVerificationUrlPipe)
    verificationRedirectUrl: string,
  ) {
    const { email, token } = await this.usersService.requestVerificationCode(
      user.userId,
      tokenId,
    );

    await this.mailService.sendVerificationEmail(
      email,
      `${verificationRedirectUrl}/${token}`,
    );

    return { message: 'A verification link has been sent to your inbox' };
  }

  @Post('verify')
  async completeVerification(
    @ExtractUser() user: { userId: string },

    @ExtractTokenId() tokenId: string,
    @Body('token') token: string,
  ) {
    await this.usersService.verifyUserAccount(user.userId, tokenId, token);
    return { message: 'Account has been verified successfully' };
  }

  @Post('update-password')
  async updatePassword(
    @ExtractUser() user: { userId: string },
    @ExtractTokenId() tokenId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updateUserPassword(
      user.userId,
      tokenId,
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
  deleteAccount(
    @ExtractUser() user: { userId: string },
    @ExtractTokenId() tokenId: string,
  ) {
    return this.usersService.delete(user.userId, tokenId);
  }
}
