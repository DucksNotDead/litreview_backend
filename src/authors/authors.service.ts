import { Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { DBService } from '../db/db.service';
import { useFilters } from '../../shared/utils/useFilters';
import { Author } from './entities/author.entity';
import { ilike } from '../../shared/utils/ilike';

@Injectable()
export class AuthorsService {
  constructor(private readonly dbService: DBService) {}

  create({ fio, description, birth_date, death_date }: CreateAuthorDto) {
    return this.dbService.create<Author>(
      `
        INSERT INTO authors (fio, description, birth_date, death_date)
        VALUES ($1, $2, $3, $4)
      `,
      [fio, description, birth_date, death_date],
    );
  }

  findAll(options?: { filters?: { fio?: string } }) {
    const [filtersSection, filtersParams] = useFilters(options?.filters, {
      fio: ['a.fio LIKE $1', [ilike(options?.filters?.fio)]],
    });

    return this.dbService.query<Author>(
      `
        SELECT a.id, a.fio, a.description, a.birth_date, a.death_date, a.photo_url, a.created_date,
          IF(
              u.id IS NULL,
              NULL,
              JSON_OBJECT(
                  'id', u.id,
                  'fio', u.fio,
                  'email', u.email,
                  'is_admin', u.is_admin,
                  'avatar_url', u.avatar_url
              )
          ) AS creator,
        
          -- Средняя оценка автора
          (
              SELECT IFNULL(AVG(book_avg_mark), 0)
              FROM (
                  SELECT b.id, AVG(r.mark) AS book_avg_mark
                  FROM books b
                  JOIN books_authors ba ON ba.book_id = b.id
                  LEFT JOIN reviews r ON r.book_id = b.id
                  WHERE ba.author_id = a.id
                  GROUP BY b.id
              ) AS book_avg
          ) AS rating
        FROM authors a
        LEFT JOIN users u ON a.creator_id = u.id
        ${filtersSection}
      `,
      [...filtersParams],
    );
  }

  private findOne(id: number) {
    return this.dbService.item<Author>('SELECT * FROM authors WHERE id = $1', [
      id,
    ]);
  }

  async update(
    id: number,
    { fio, description, birth_date, death_date }: UpdateAuthorDto,
  ) {
    await this.dbService.item(
      `
        UPDATE authors 
        SET fio = $2, description = $3, birth_date = $4, death_date = $5
        WHERE id = $1
      `,
      [id, fio, description, birth_date, death_date],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.dbService.item(
      `
        DELETE FROM authors
        WHERE id = $1
      `,
      [id],
    );

    const books_authors = await this.dbService.query(
      `
        SELECT book_id as id
        FROM books_authors
        WHERE author_id = $1
      `,
      [id],
    );

    for (const { id } of books_authors) {
      await this.dbService.item(
        `
          DELETE FROM books
          WHERE id = $1
        `,
        [id],
      );
    }

    return id;
  }
}
