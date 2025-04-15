import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DBService } from '../db/db.service';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(private readonly dbService: DBService) {}

  create({ book_id, title, body, mark }: CreateReviewDto, creatorId: number) {
    return this.dbService.create<Review>(
      `
        INSERT INTO reviews (book_id, creator_id, title, body, mark)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [book_id, creatorId, title, body, mark],
    );
  }

  findAllByBook(bookId: number) {
    return this.dbService.query<Review>(
      `
        SELECT r.id, r.title, r.body, r.created_date, r.mark,
               JSON_OBJECT(
                    'id', u.id,
                    'fio', u.fio,
                    'email', u.email,
                    'is_admin', u.is_admin,
                    'avatar_url', u.avatar_url
                ) as creator
        FROM reviews r
        LEFT JOIN users u ON r.creator_id = u.id
        WHERE r.book_id = $1;
      `,
      [bookId],
    );
  }

  private findOne(id: number) {
    return this.dbService.item<Review>('SELECT * FROM reviews WHERE id = $1', [
      id,
    ]);
  }

  async update(
    id: number,
    { title, body, mark }: UpdateReviewDto,
    userId: number,
  ) {
    const { creator_id } = await this.findOne(id);
    if (creator_id !== userId) {
      throw new ForbiddenException('User is not creator');
    }

    await this.dbService.item(
      `
        UPDATE reviews 
        SET title = $2, body = $3, mark = $4
        WHERE id = $1
      `,
      [id, title, body, mark],
    );

    return this.findOne(id);
  }

  async remove(id: number, userId: number) {
    const { creator_id } = await this.findOne(id);
    if (creator_id !== userId) {
      throw new ForbiddenException('User is not creator');
    }

    await this.dbService.item(
      `
        DELETE FROM reviews 
        WHERE id = $1
      `,
      [id],
    );

    return id;
  }
}
