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
import { ExtractUser } from '../../common/decorators/extract-user';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './review.service';
import { DatabaseService } from '../database/database.service';

@UseGuards(AccessTokenGuard)
@Controller('products/:id/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly databaseService: DatabaseService,
  ) {}

  @HttpCode(201)
  @Post()
  create(
    @ExtractUser() user: { userId: string; userRole: UserRoleEnum },
    @Param(':id', ParseMongoIdPipe) productId: string,
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
    @Param(':id', ParseMongoIdPipe) productId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.reviewsService.findAll(productId, page, limit);
  }

  @Get(':id')
  findOne(@Param(':id', ParseMongoIdPipe) reviewId: string) {
    return this.reviewsService.findOne(reviewId);
  }

  @Patch(':id')
  update(
    @Param(':id', ParseMongoIdPipe) productId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(productId, updateReviewDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param(':id', ParseMongoIdPipe) productId: string) {
    return this.reviewsService.remove(productId);
  }
}
