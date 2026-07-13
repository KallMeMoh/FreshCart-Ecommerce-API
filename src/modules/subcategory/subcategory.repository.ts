import { Injectable } from '@nestjs/common';
import { Subcategory } from './entities/subcategory.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubcategoriesRepository {
  constructor(
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,
  ) {}

  create(data: Omit<Subcategory, '_id' | 'slug' | 'createdAt' | 'updatedAt'>) {
    return this.subcategoryModel.create(data);
  }

  async findById(subcategoryId: string) {
    return this.subcategoryModel.findById(subcategoryId);
  }

  async findAll() {
    return this.subcategoryModel.find({}, '-__v').lean();
  }

  async findBySlug(slug: string) {
    return this.subcategoryModel.findOne({ slug }, '-__v').lean();
  }

  async updateOne(slug: string, data: Partial<Subcategory>) {
    return this.subcategoryModel.findOneAndUpdate({ slug }, data, {
      returnDocument: 'after',
    });
  }

  deleteOne(_id: string) {
    return this.subcategoryModel.deleteOne({ _id });
  }
}
