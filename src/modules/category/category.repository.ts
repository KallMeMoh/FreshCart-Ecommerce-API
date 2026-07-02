import { Injectable } from '@nestjs/common';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  create(data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) {
    return this.categoryModel.create(data);
  }

  async findById(categoryId: string) {
    return this.categoryModel.findById(categoryId);
  }

  async findAll() {
    return this.categoryModel.find({}, '-__v').lean();
  }

  async findBySlug(slug: string) {
    return this.categoryModel.findOne({ slug }, '-__v').lean();
  }

  async updateOne(slug: string, data: Partial<Category>) {
    return this.categoryModel.findOneAndUpdate({ slug }, data, {
      returnDocument: 'after',
    });
  }

  deleteOne(_id: string) {
    return this.categoryModel.deleteOne({ _id });
  }
}
