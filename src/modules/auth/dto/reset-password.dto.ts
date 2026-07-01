import { IsString, IsStrongPassword, Matches } from 'class-validator';
import { MatchesField } from '../../../common/decorators/matches-field';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
    message: 'Malformed token',
  })
  token!: string;

  @IsStrongPassword()
  new_password!: string;

  @IsStrongPassword()
  @MatchesField('new_password', { message: 'Passwords do not match' })
  confirm_new_password!: string;
}
