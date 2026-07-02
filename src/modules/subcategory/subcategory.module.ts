import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subcategory, SubcategorySchema } from './entities/subcategory.entity';
import { SubcategoriesController } from './subcategory.controller';
import { SubcategoriesService } from './subcategory.service';
import { SubcategoriesRepository } from './subcategory.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subcategory.name, schema: SubcategorySchema },
    ]),
  ],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService, SubcategoriesRepository],
})
export class SubcategoriesModule {}
