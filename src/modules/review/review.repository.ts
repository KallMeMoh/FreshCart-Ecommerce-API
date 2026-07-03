import { Injectable } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  async create(
    data: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>,
    session?: ClientSession,
  ) {
    const [review] = await this.reviewModel.create([data], { session });
    return review;
  }

  async findById(reviewId: string) {
    return this.reviewModel.findById(reviewId);
  }

  async findAll(product: string, page: number = 1, limit: number = 10) {
    return this.reviewModel
      .find({ product }, '-__v')
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('product')
      .lean();
  }

  async updateOne(slug: string, data: Partial<Review>) {
    return this.reviewModel.findOneAndUpdate({ slug }, data, {
      returnDocument: 'after',
    });
  }

  deleteOne(_id: string) {
    return this.reviewModel.deleteOne({ _id });
  }
}
