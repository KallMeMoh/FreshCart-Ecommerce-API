import { IsStrongPassword } from 'class-validator';
import { MatchesField } from '../../../common/decorators/matches-field.decorator';

export class ResetPasswordDto {
  @IsStrongPassword()
  new_password!: string;

  @IsStrongPassword()
  @MatchesField('new_password', { message: 'Passwords do not match' })
  confirm_new_password!: string;
}
