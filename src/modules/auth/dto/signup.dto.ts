import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MatchesField } from '../../../common/decorators/matches-field';

export class SignupDto {
  @Transform(({ value }: { value?: string }) => value?.trim())
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(20, { message: 'Username must be at most 20 characters' })
  @Matches(/^[A-Z]/, {
    message: 'Username must start with an uppercase letter',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only include _ special character',
  })
  username!: string;

  @Transform(({ value }: { value?: string }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsStrongPassword()
  @MatchesField('password', { message: 'Passwords do not match' })
  confirm_password!: string;
}
