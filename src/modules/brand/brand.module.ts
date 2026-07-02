import { Module } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { BrandsController } from './brand.controller';
import { BrandsRepository } from './brand.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './entities/brand.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
