import { Module } from '@nestjs/common';
import { UsersModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtModule } from '../token/jwt.module';

@Module({
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
  imports: [JwtModule, UsersModule],
})
export class AuthModule {}
