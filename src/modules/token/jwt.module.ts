import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { JwtService } from './jwt.service';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.accessSecret,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
