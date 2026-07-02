import { Injectable } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  create(data: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>) {
    return this.reviewModel.create(data);
  }

  async findById(reviewId: string) {
    return this.reviewModel.findById(reviewId);
  }

  async findAll() {
    return this.reviewModel.find({}, '-__v').lean();
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
