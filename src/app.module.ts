import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { CryptoModule } from './crypto/crypto.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from './config/config.service';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule, // global
    DatabaseModule, // global
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.redisUrl,
      }),
    }), // global
    CryptoModule, // global
    MailModule, //global
    // features
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
