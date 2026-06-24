import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

// note to self: in order to initialize Mongo connection we need
// the connection url, the way we get that is from ConfigService,
// that means that MongooseModule configuration is only available
// at runtime, so it has to be a dynamic module, and then this
// dynamic module imports ConfigModule because it exposes it's
// ConfigService.
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.databaseUrl,
      }),
    }),
  ],
})
export class DatabaseModule {}
