import { Injectable } from '@nestjs/common';
import { Subcategory } from './entities/subcategory.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubcategoryRepository {
  constructor(
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,
  ) {}
}
