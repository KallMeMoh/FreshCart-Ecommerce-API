import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import { DatabaseService } from './database.service';

// note to self: in order to initialize Mongo connection we need
// the connection url, the way we get that is from ConfigService,
// that means that MongooseModule configuration is only available
// at runtime, so it has to be a dynamic module, and then this
// dynamic module imports ConfigModule because it exposes it's
// ConfigService.

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.databaseUrl,
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
