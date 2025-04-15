import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Account } from '../../shared/decorators/account';
import { User } from '../users/entities/user.entity';
import { Public } from '../../shared/decorators/public';
import { Admin } from '../../shared/decorators/admin';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Account() account: User) {
    return this.reviewsService.create(createReviewDto, account?.id);
  }

  @Public()
  @Get(':bookId')
  findByBook(@Param('bookId') bookId: string) {
    return this.reviewsService.findAllByBook(+bookId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Account() account: User,
  ) {
    return this.reviewsService.update(+id, updateReviewDto, account.id);
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string, @Account() account: User) {
    return this.reviewsService.remove(+id, account.id);
  }
}
