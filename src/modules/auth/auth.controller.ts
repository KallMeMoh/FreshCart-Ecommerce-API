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
import { ExtractUser } from '../../common/decorators/extract-user.decorator';
import { ClientTypeEnum } from '../../common/enums/client-type.enum';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { ParseClientTypePipe } from '../../common/pipes/parse-client-type.pipe';
import { RequiredFieldPipe } from '../../common/pipes/required-field.pipe';
import type { RUser } from '../../types/express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginCompletionDto } from './dto/login-completion.dto';
import { LoginDto, LoginPendingDto, LoginSuccessDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtService } from '../token/jwt.service';
import { ConfigService } from '../config/config.service';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { ValidationErrorResponseDto } from '../../common/dto/validation-error-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Register a new user account.',
    description:
      'Creates a new user account and sends a verification email automatically,' +
      'the account  is usable immediately but flagged as unverified until the link is clicked.\n' +
      'Note: Verification link sent point to a frontend page at /verify/:token',
  })
  @ApiCreatedResponse({ description: 'User account create successfully' })
  @ApiResponse({
    status: 400,
    type: ValidationErrorResponseDto,
    description: 'Validation Failed; Match Signup Schema',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 409,
    description: 'An account with this email already exists.',
  })
  @HttpCode(201)
  @Post('signup')
  async signup(@Body() body: SignupDto) {
    await this.authService.signup(body);
  }

  @ApiOperation({
    summary: 'Login to an existing account.',
    description:
      'Authenticates a user and returns an access + refresh token pair for accessing protected routes.\n' +
      'Note: if the account has 2FA enabled, a pendingToken is returned instead of a access + refresh token pair.',
  })
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Identifies the calling client. Determines whether tokens are set as httpOnly cookies (Web) or returned in the response body (Mobile).',
    enum: ClientTypeEnum,
    required: true,
  })
  @ApiExtraModels(LoginSuccessDto, LoginPendingDto)
  @ApiOkResponse({
    description: 'Login succeeded, or 2FA verification is now required.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LoginSuccessDto) },
        { $ref: getSchemaPath(LoginPendingDto) },
      ],
    },
  })
  @ApiResponse({
    type: ValidationErrorResponseDto,
    status: 400,
    description: 'Request body/query failed validation.',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 401,
    description: 'Invalid email or password.',
  })
  @HttpCode(200)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @ClientType('x-client-type', ParseClientTypePipe)
    clientType: ClientTypeEnum,
    @Body() body: LoginDto,
  ) {
    const credentials = await this.authService.login(body);

    if (credentials.requires2FA) {
      return {
        requires2FA: true,
        pendingToken: credentials.pendingToken,
      };
    } else {
      if (clientType === ClientTypeEnum.Web) {
        res.cookie('refreshToken', credentials.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24 * 7,
          path: '/',
        });

        return {
          requires2FA: false,
          accessToken: credentials.accessToken,
        };
      } else {
        return {
          requires2FA: false,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
        };
      }
    }
  }

  @ApiOperation({
    summary: 'Login Completion endpoint for 2FA protected accounts.',
    description:
      'Verifies inigrity of 2FA code then authenticates a user and returns an access + refresh token pair for accessing protected routes.',
  })
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Identifies the calling client. Determines whether tokens are set as httpOnly cookies (Web) or returned in the response body (Mobile).',
    enum: ClientTypeEnum,
    required: true,
  })
  @ApiOkResponse({
    description: 'Login succeeded, or 2FA verification is now required.',
    type: LoginSuccessDto,
  })
  @ApiResponse({
    type: ValidationErrorResponseDto,
    status: 400,
    description: 'Request body/query failed validation.',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 401,
    description: 'Invalid token or otp.',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 429,
    description: 'Ratelimited for frequent incorrect tries.',
  })
  @HttpCode(200)
  @Post('login/complete')
  async completeLogin(
    @Body() { token, otp }: LoginCompletionDto,
    @Res({ passthrough: true }) res: Response,
    @ClientType('x-client-type', ParseClientTypePipe)
    clientType: ClientTypeEnum,
  ) {
    const payload = await this.jwtService.validate(
      token,
      this.configService.pendingSecret,
    );

    const { accessToken, refreshToken } = await this.authService.completeLogin(
      payload,
      otp,
    );

    if (clientType === ClientTypeEnum.Web) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
      });

      return {
        accessToken,
      };
    } else {
      return {
        accessToken,
        refreshToken,
      };
    }
  }

  @ApiOperation({
    summary: 'Register a new user account with OAuth.',
    description: 'Creates a new verified by default user account.\n',
  })
  @ApiCreatedResponse({ description: 'User account create successfully' })
  @ApiResponse({
    status: 400,
    type: ValidationErrorResponseDto,
    description: 'Validation Failed; Match Signup Schema',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 409,
    description: 'An account with this email already exists.',
  })
  @HttpCode(201)
  @Post('oauth/signup/google')
  async googleOAuthSignup(@Body('idToken', RequiredFieldPipe) idToken: string) {
    await this.authService.googleSignup(idToken);
  }

  @ApiOperation({
    summary: 'Login to an existing account.',
    description:
      'Authenticates a user and returns an access + refresh token pair for accessing protected routes.\n' +
      'Note: if the account has 2FA enabled, a pendingToken is returned instead of a access + refresh token pair.',
  })
  @ApiOkResponse({
    description: 'Login succeeded, or 2FA verification is now required.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LoginSuccessDto) },
        { $ref: getSchemaPath(LoginPendingDto) },
      ],
    },
  })
  @ApiResponse({
    type: ValidationErrorResponseDto,
    status: 400,
    description: 'Request body/query failed validation.',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 401,
    description: 'Invalid credentials.',
  })
  @HttpCode(200)
  @Post('oauth/login/google')
  async googleOAuthLogin(@Body('idToken', RequiredFieldPipe) idToken: string) {
    await this.authService.googleLogin(idToken);
  }

  @ApiOperation({
    summary: 'Refresh access token.',
    description:
      'Provides a new short-lived access token.\n' +
      'Note: Then endpoint looks for a an http-only cookie containing the refresh token set by the server in an earlier response,' +
      'if not found; it will fallback to extracting it from the Authorization header.',
  })
  @ApiOkResponse({
    description: 'Successful access token rotation',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 401,
    description: 'Expired refresh token.',
  })
  @ApiCookieAuth('refreshToken')
  @ApiBearerAuth('refresh-token-header')
  @HttpCode(204)
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  refreshToken(@ExtractUser() user: RUser) {
    const accessToken = this.authService.rotateToken(user);
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Email a password reset link.',
    description:
      'Creates and emails a password reset link for users with a verified email address that forgot their passwords.\n' +
      'Note: ouath accounts do not get a password, hitting this endpoints evaluate to NOP.',
  })
  @ApiNoContentResponse({
    description:
      'An Email is sent if a user account associated with this email exists.',
  })
  @HttpCode(204)
  @Post('forget-password')
  async forgetPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.resetPassword(body);
  }

  @ApiOperation({
    summary: 'Reset account password.',
    description: 'Resets user password given a valid password reset token.',
  })
  @ApiNoContentResponse({
    description: 'Password reset successfully',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 401,
    description: 'Invalid password reset token.',
  })
  @HttpCode(204)
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: ResetPasswordDto,
  ) {
    await this.authService.verifyResetPassword(token, body);
  }

  @ApiOperation({
    summary: 'Revoke access token.',
    description: "Revokes the user's token pairs",
  })
  @ApiNoContentResponse({
    description: 'Token pairs revoked successfully',
  })
  @ApiResponse({
    type: ErrorResponseDto,
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth('access-token-header')
  @HttpCode(204)
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@ExtractUser() user: RUser) {
    await this.authService.blacklistToken(user.tokenId);
  }
}
