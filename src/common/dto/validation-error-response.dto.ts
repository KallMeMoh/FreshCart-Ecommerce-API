import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: [
      'email must be an email',
      'password should not be empty',
      'otp must be 6 digits long',
    ],
    type: [String],
  })
  message!: string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}
