import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginCompletionDto {
  @ApiProperty({
    description:
      'The temporary or partial login token received from the initial login step.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description:
      "The 6-digit One-Time Password sent to the user's registered device.",
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNumberString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Transform(({ value }: { value: string }) => value?.trim())
  otp!: string;
}
