import { IsStrongPassword } from 'class-validator';
import { MatchesField } from '../../../common/decorators/matches-field.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'v3Ry_sTr0nG#paSs',
    description: 'Whatever strong password is',
  })
  @IsStrongPassword()
  new_password!: string;

  @ApiProperty({
    example: 'v3Ry_sTr0nG#paSs',
    description: 'Match new_password.',
  })
  @IsStrongPassword()
  @MatchesField('new_password', { message: 'Passwords do not match' })
  confirm_new_password!: string;
}
