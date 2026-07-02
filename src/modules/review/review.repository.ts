import { Injectable } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}
}
