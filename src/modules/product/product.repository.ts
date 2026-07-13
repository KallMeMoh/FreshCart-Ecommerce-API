import { Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  create(data: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) {
    return this.productModel.create(data);
  }

  async updateReview(_id: string, rating: number, session?: ClientSession) {
    return this.productModel.updateOne(
      { _id },
      [
        {
          $set: {
            averageRating: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$averageRating', '$reviewCount'] },
                    rating,
                  ],
                },
                { $add: ['$reviewCount', 1] },
              ],
            },
            reviewCount: { $add: ['$reviewCount', 1] },
          },
        },
      ],
      { session },
    );
  }
}
