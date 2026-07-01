import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
  imports: [
    UserModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.accessSecret,
        signOptions: { expiresIn: '15m' },
      }),
    }),
    MailModule,
  ],
})
export class AuthModule {}
