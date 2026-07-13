import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @Transform(({ value }: { value?: string }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({
    example: 'v3Ry_sTr0nG#paSs',
    description: 'Whatever strong password is',
  })
  @IsStrongPassword()
  password!: string;
}

export class LoginPendingDto {
  @ApiProperty({
    enum: [true],
    description:
      'Whether the account requires a 2FA OTP before full access is granted.',
  })
  requires2FA!: true;

  @ApiProperty({
    description: 'Short-lived token used to complete 2FA verification.',
  })
  pendingToken!: string;
}

export class LoginSuccessDto {
  @ApiProperty({
    enum: [false],
    description:
      'Whether the account requires a 2FA OTP before full access is granted.',
  })
  requires2FA!: false;

  @ApiProperty({
    description:
      'Short-lived JWT used to authorize requests to protected routes.',
  })
  accessToken!: string;

  @ApiPropertyOptional({
    description:
      'Long-lived token used to obtain a new access token. Present only for non-Web clients — Web clients receive it as an httpOnly cookie instead.',
  })
  refreshToken?: string;
}
