import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginConfirmationDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @Matches(/[^a-zA-Z0-9]/, {
    message: 'Passwords must contain at least one special character',
  })
  otp!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
    message: 'Malformed token',
  })
  token!: string;
}
