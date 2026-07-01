import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { plainToInstance } from 'class-transformer';
import { EnvironmentVariables } from './dto/env.dto';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (config) => plainToInstance(EnvironmentVariables, config),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
