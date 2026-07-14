import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductsController } from './product.controller';
import { ProductsRepository } from './product.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { ReviewsController } from '../review/review.controller';
import { ReviewsService } from '../review/review.service';
import { ReviewsRepository } from '../review/review.repository';
import { Review, ReviewSchema } from '../review/entities/review.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ProductsController, ReviewsController],
  providers: [
    ProductsService,
    ReviewsService,
    ProductsRepository,
    ReviewsRepository,
  ],
  exports: [ProductsRepository, ReviewsRepository],
})
export class ProductsModule {}
