import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginConfirmationDto } from './dto/login-confirmation.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import type { Request } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AccessTokenGuard } from '../../common/guards/access-toke.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-toke.guard';
import { ExtractUser } from '../../common/decorators/extract-user';
import { ExtractTokenId } from '../../common/decorators/extract-token-id';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    await this.authService.signup(body);
    return { message: 'Account created successfully' };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const credentials = await this.authService.login(body);
    return {
      message: credentials.requires2FA
        ? 'Please provide your 2FA OTP'
        : 'Logged in successfully',
      credentials,
    };
  }

  @Post('login/confirm')
  async confirmLogin(@Body() body: LoginConfirmationDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { requires2FA, ...credentials } =
      await this.authService.confirmLogin(body);
    return { message: 'Logged in successfully', credentials };
  }

  @HttpCode(201)
  @Post('oauth/signup/google')
  async googleOAuthSignup(@Body('idToken') idToken: string) {
    await this.authService.googleSignup(idToken);
    return { message: 'Account created successfully' };
  }

  @Post('oauth/login/google')
  async googleOAuthLogin(@Body('idToken') idToken: string) {
    const tokens = await this.authService.googleLogin(idToken);
    return { message: 'Logged in successfully', ...tokens };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  refreshToken(@ExtractUser() user: User, @ExtractTokenId() tokenId: string) {
    const accessToken = this.authService.rotateToken(user, tokenId);
    return { message: 'Token refreshed successfully', accessToken };
  }

  @Post('forget-password')
  async forgetPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.resetPassword(body);
    return {
      message:
        'You will receive an email shortly if you had registered with us',
    };
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
  ) {
    await this.authService.verifyResetPassword(token, body);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    await this.authService.blacklistToken(req.tokenId!);
    return { message: 'Token revoked successfully' };
  }
}
