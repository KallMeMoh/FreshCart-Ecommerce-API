import { IsString, IsStrongPassword } from 'class-validator';
import { MatchesField } from '../../../common/decorators/matches-field';

export class UpdatePasswordDto {
  @IsString()
  old_password!: string;

  @IsStrongPassword()
  new_password!: string;

  @IsStrongPassword()
  @MatchesField('password', { message: 'Passwords do not match' })
  confirm_new_password!: string;
}
