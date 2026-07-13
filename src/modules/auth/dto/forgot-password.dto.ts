import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @Transform(({ value }: { value?: string }) => value?.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}
