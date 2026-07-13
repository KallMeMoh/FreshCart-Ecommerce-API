import { Injectable } from '@nestjs/common';
import { Brand } from './entities/brand.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BrandsRepository {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
  ) {}

  create(data: Omit<Brand, '_id' | 'slug' | 'createdAt' | 'updatedAt'>) {
    return this.brandModel.create(data);
  }

  async findById(brandId: string) {
    return this.brandModel.findById(brandId);
  }

  async findAll() {
    return this.brandModel.find({}, '-__v').lean();
  }

  async findBySlug(slug: string) {
    return this.brandModel.findOne({ slug }, '-__v').lean();
  }

  async updateOne(slug: string, data: Partial<Brand>) {
    return this.brandModel.findOneAndUpdate({ slug }, data, {
      returnDocument: 'after',
    });
  }

  deleteOne(_id: string) {
    return this.brandModel.deleteOne({ _id });
  }
}
