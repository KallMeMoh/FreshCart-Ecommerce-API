import { Transform } from 'class-transformer';
import { IsEmail, IsUrl } from 'class-validator';

export class ForgotPasswordDto {
  @Transform(({ value }: { value?: string }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsUrl()
  verificationRedirectUrl!: string;
}
