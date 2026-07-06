import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClientType } from '../../common/decorators/client-type.decorator';
import { ExtractUser } from '../../common/decorators/extract-user';
import { ClientTypeEnum } from '../../common/enums/client-type.enum';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { PendingTokenGuard } from '../../common/guards/pending-token.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { ParseClientTypePipe } from '../../common/pipes/parse-client-type.pipe';
import { ParseOtpPipe } from '../../common/pipes/parse-otp.pipe';
import type { RUser } from '../../types/express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { RequiredFieldPipe } from '../../common/pipes/required-field.pipe';

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
  async login(
    @Res({ passthrough: true }) res: Response,
    @ClientType('x-client-type', ParseClientTypePipe)
    clientType: ClientTypeEnum,
    @Body() body: LoginDto,
  ) {
    const { requires2FA, accessToken, refreshToken, pendingToken } =
      await this.authService.login(body);

    if (clientType === ClientTypeEnum.Web) {
      res.cookie(
        requires2FA ? 'pendingToken' : 'refreshToken',
        requires2FA ? pendingToken : refreshToken,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: requires2FA ? 1000 * 60 * 5 : 1000 * 60 * 60 * 24 * 7,
          path: '/',
        },
      );
    }

    return {
      message: requires2FA
        ? 'Please provide your 2FA OTP'
        : 'Logged in successfully',

      credentials: {
        requires2FA,
        accessToken,
        ...(clientType !== ClientTypeEnum.Web
          ? {
              pendingToken,
              refreshToken,
            }
          : {}),
      },
    };
  }

  @Post('login/complete')
  @UseGuards(PendingTokenGuard)
  async completeLogin(
    @Body('otp', ParseOtpPipe) otp: string,
    @ExtractUser() user: RUser,
    @Res({ passthrough: true }) res: Response,
    @ClientType('x-client-type', ParseClientTypePipe)
    clientType: ClientTypeEnum,
  ) {
    const { requires2FA, accessToken, refreshToken, pendingToken } =
      await this.authService.completeLogin(user, otp);

    if (clientType === ClientTypeEnum.Web) {
      res.cookie(
        requires2FA ? 'pendingToken' : 'refreshToken',
        requires2FA ? pendingToken : refreshToken,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: requires2FA ? 1000 * 60 * 5 : 1000 * 60 * 60 * 24 * 7,
          path: '/',
        },
      );
    }

    return {
      message: 'Logged in successfully',
      credentials: {
        accessToken,
        ...(clientType !== ClientTypeEnum.Web
          ? {
              refreshToken,
            }
          : {}),
      },
    };
  }

  @HttpCode(201)
  @Post('oauth/signup/google')
  async googleOAuthSignup(@Body('idToken', RequiredFieldPipe) idToken: string) {
    await this.authService.googleSignup(idToken);
    return { message: 'Account created successfully' };
  }

  @Post('oauth/login/google')
  async googleOAuthLogin(@Body('idToken', RequiredFieldPipe) idToken: string) {
    const tokens = await this.authService.googleLogin(idToken);
    return { message: 'Logged in successfully', ...tokens };
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  refreshToken(@ExtractUser() user: RUser) {
    const accessToken = this.authService.rotateToken(user);
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
    return { message: 'Password reset successfully' };
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@ExtractUser() user: RUser) {
    await this.authService.blacklistToken(user.tokenId);
    return { message: 'Token revoked successfully' };
  }
}
