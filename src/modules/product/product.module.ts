import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductsController } from './product.controller';
import { ProductsRepository } from './product.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
