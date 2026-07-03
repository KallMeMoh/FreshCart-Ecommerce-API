import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsRepository } from './review.repository';
import { ProductsRepository } from '../product/product.repository';
import { ClientSession, Types } from 'mongoose';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(
    {
      authorId,
      productId,
      body,
    }: {
      authorId: string;
      productId: string;
      body: CreateReviewDto;
    },
    session: ClientSession,
  ) {
    await this.productsRepository.updateReview(productId, body.review, session);
    return await this.reviewsRepository.create(
      {
        author: new Types.ObjectId(authorId),
        product: new Types.ObjectId(productId),
        ...body,
      },
      session,
    );
  }

  findAll(productId: string, page: number, limit: number) {
    return this.reviewsRepository.findAll(productId, page, limit);
  }

  findOne(id: string) {
    return this.reviewsRepository.findById(id);
  }

  update(id: string, updateReviewDto: UpdateReviewDto) {
    return this.reviewsRepository.updateOne(id, updateReviewDto);
  }

  remove(id: string) {
    return this.reviewsRepository.deleteOne(id);
  }
}
