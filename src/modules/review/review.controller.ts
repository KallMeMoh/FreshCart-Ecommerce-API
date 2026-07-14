import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExtractUser } from '../../common/decorators/extract-user.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './review.service';
import { DatabaseService } from '../database/database.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AccessTokenGuard)
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly databaseService: DatabaseService,
  ) {}

  @HttpCode(201)
  @ApiBearerAuth('access-token-header')
  @Post()
  create(
    @ExtractUser() user: { userId: string; userRole: UserRoleEnum },
    @Param(':productId', ParseMongoIdPipe) productId: string,
    @Body() body: CreateReviewDto,
  ) {
    return this.databaseService.runInTransaction(async (session) => {
      await this.reviewsService.create(
        { authorId: user.userId, productId, body },
        session,
      );
    });
  }

  @Get()
  findAll(
    @Param(':productId', ParseMongoIdPipe) productId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.reviewsService.findAll(productId, page, limit);
  }

  @Get(':reviewId')
  findOne(@Param(':reviewId', ParseMongoIdPipe) reviewId: string) {
    return this.reviewsService.findOne(reviewId);
  }

  @ApiBearerAuth('access-token-header')
  @Patch(':reviewId')
  update(
    @Param(':reviewId', ParseMongoIdPipe) reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(reviewId, updateReviewDto);
  }

  @ApiBearerAuth('access-token-header')
  @HttpCode(204)
  @Delete(':reviewId')
  async remove(@Param(':reviewId', ParseMongoIdPipe) reviewId: string) {
    await this.reviewsService.remove(reviewId);
  }
}
