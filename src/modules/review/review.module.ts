import { Module } from '@nestjs/common';
import { ReviewsService } from './review.service';
import { ReviewsController } from './review.controller';
import { ReviewsRepository } from './review.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './entities/review.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
