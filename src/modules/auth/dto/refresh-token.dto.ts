import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description:
      'Short-lived JWT used to authorize requests to protected routes.',
  })
  accessToken!: string;
}
