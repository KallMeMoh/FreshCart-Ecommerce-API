import { RedisModule } from '@nestjs-modules/ioredis';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brand/brand.module';
import { R2BucketModule } from './modules/bucket/bucket.module';
import { CategoriesModule } from './modules/category/category.module';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { DatabaseModule } from './modules/database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { ProductsModule } from './modules/product/product.module';
import { ReviewsModule } from './modules/review/review.module';
import { SubcategoriesModule } from './modules/subcategory/subcategory.module';
import { UsersModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule, // global
    DatabaseModule, // global
    EventEmitterModule.forRoot({ global: true }), // global
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.redisUrl,
      }),
    }), // global
    MailModule, //global
    R2BucketModule, // global
    // CryptoModule, incase I need it in the future
    // features
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    SubcategoriesModule,
    BrandsModule,
    ReviewsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
