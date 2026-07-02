import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtModule } from '../token/jwt.module';

@Module({
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
  imports: [JwtModule, UserModule],
})
export class AuthModule {}
