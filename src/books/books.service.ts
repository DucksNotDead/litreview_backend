import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { DBService } from '../db/db.service';
import { Book, BookExtended } from './entities/book.entity';
import { ilike } from '../../shared/utils/ilike';
import { InnerFindBookDto } from './dto/find-books.dto';

@Injectable()
export class BooksService {
  constructor(private readonly dbService: DBService) {}

  async create({
    title,
    description,
    pages_count,
    published_date,
    category_ids,
    author_ids,
  }: CreateBookDto) {
    const { id } = await this.dbService.create(
      `
        INSERT INTO books (title, description, pages_count, published_date)
        VALUES ($1, $2, $3, $4)
      `,
      [title, description, pages_count, published_date],
    );

    for (const authorId of author_ids) {
      await this.dbService.item(
        `
        INSERT INTO books_authors (book_id, author_id)
        VALUES ($1, $2)
      `,
        [id, authorId],
      );
    }

    for (const categoryId of category_ids) {
      await this.dbService.item(
        `
        INSERT INTO books_categories (book_id, category_id)
        VALUES ($1, $2)
      `,
        [id, categoryId],
      );
    }

    return this.findById(id);
  }

  findAll(options?: { filters?: InnerFindBookDto }) {
    const filtersParams: unknown[] = [];

    const getParamIndex = () => filtersParams.length + 1;

    const getTitleFilter = () => {
      if (!options?.filters?.title) {
        return '';
      }
      const sql = ` AND b.title LIKE $${getParamIndex()}`;
      filtersParams.push(ilike(options.filters.title));
      return sql;
    };

    const getAuthorsFilter = () => {
      if (!options?.filters?.authorIds?.length) {
        return '';
      }
      const sql = ` AND a.id IN ($${getParamIndex()})`;
      filtersParams.push(options.filters.authorIds);
      return sql;
    };

    const getCategoriesFilter = () => {
      if (!options?.filters?.categoryIds?.length) {
        return '';
      }
      const sql = ` AND c.id IN ($${getParamIndex()})`;
      filtersParams.push(options.filters.categoryIds);
      return sql;
    };

    return this.dbService.query<BookExtended>(
      `
        SELECT
            b.id,
            b.title,
            b.description,
            b.published_date,
            b.pages_count,
            b.cover_url,
        
            -- Создатель
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
        
            -- Авторы
            (
                SELECT CAST(
                    IF(
                        COUNT(a.id) = 0,
                        '[]',
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', a.id,
                                'fio', a.fio,
                                'description', a.description
                            )
                        )
                    ) AS JSON
                )
                FROM books_authors ba
                JOIN authors a ON ba.author_id = a.id
                WHERE ba.book_id = b.id
            ) AS authors,
        
            -- Категории
            (
                SELECT CAST(
                    IF(
                        COUNT(c.id) = 0,
                        '[]',
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', c.id,
                                'name', c.name,
                                'description', c.description,
                                'color', c.color
                            )
                        )
                    ) AS JSON
                )
                FROM books_categories bc
                JOIN categories c ON bc.category_id = c.id
                WHERE bc.book_id = b.id
            ) AS categories,
          
          -- Рейтинг
          (
              SELECT IFNULL(AVG(r.mark), 0)
              FROM reviews r
              WHERE r.book_id = b.id
          ) AS rating
        
        FROM books b
        LEFT JOIN users u ON b.creator_id = u.id
        WHERE 1 = 1
        ${getTitleFilter()}
        AND EXISTS (
            SELECT 1
            FROM books_categories bc
            JOIN categories c ON bc.category_id = c.id
            WHERE bc.book_id = b.id
            ${getCategoriesFilter()}
        )
        AND EXISTS (
            SELECT 1
            FROM books_authors ba
            JOIN authors a ON ba.author_id = a.id
            WHERE ba.book_id = b.id
            ${getAuthorsFilter()}
        )
        ;
      `,
      [...filtersParams],
    );
  }

  findById(id: number) {
    return this.dbService.item<Book>(
      `
        SELECT
            b.id,
            b.title,
            b.description,
            b.published_date,
            b.pages_count,
            b.cover_url,
        
            -- Создатель
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
        
            -- Авторы
            (
                SELECT CAST(
                    IF(
                        COUNT(a.id) = 0,
                        '[]',
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', a.id,
                                'fio', a.fio,
                                'description', a.description
                            )
                        )
                    ) AS JSON
                )
                FROM books_authors ba
                JOIN authors a ON ba.author_id = a.id
                WHERE ba.book_id = b.id
            ) AS authors,
        
            -- Категории
            (
                SELECT CAST(
                    IF(
                        COUNT(c.id) = 0,
                        '[]',
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', c.id,
                                'name', c.name,
                                'description', c.description,
                                'color', c.color
                            )
                        )
                    ) AS JSON
                )
                FROM books_categories bc
                JOIN categories c ON bc.category_id = c.id
                WHERE bc.book_id = b.id
            ) AS categories,
          
          -- Рейтинг
          (
              SELECT IFNULL(AVG(r.mark), 0)
              FROM reviews r
              WHERE r.book_id = b.id
          ) AS rating
        
        FROM books b
        LEFT JOIN users u ON b.creator_id = u.id
        WHERE b.id = $1
        ;
      `,
      [id],
    );
  }

  private findOne(id: number) {
    return this.dbService.item<Book>('SELECT * FROM books WHERE id = $1', [id]);
  }

  private async deleteAuthorsAndCategories(id: number) {
    await this.dbService.item(
      `
        DELETE FROM books_categories
        WHERE book_id = $1
      `,
      [id],
    );

    await this.dbService.item(
      `
        DELETE FROM books_authors
        WHERE book_id = $1
      `,
      [id],
    );
  }

  async update(
    id: number,
    {
      title,
      description,
      pages_count,
      published_date,
      author_ids,
      category_ids,
    }: UpdateBookDto,
  ) {
    await this.dbService.item(
      `
        UPDATE books
        SET title = $2, description = $3, pages_count = $4, published_date = $5
        WHERE id = $1
      `,
      [id, title, description, pages_count, published_date],
    );

    await this.deleteAuthorsAndCategories(id);

    for (const authorId of author_ids ?? []) {
      await this.dbService.item(
        `
        INSERT INTO books_authors (book_id, author_id)
        VALUES ($1, $2)
      `,
        [id, authorId],
      );
    }

    for (const categoryId of category_ids ?? []) {
      await this.dbService.item(
        `
        INSERT INTO books_categories (book_id, category_id)
        VALUES ($1, $2)
      `,
        [id, categoryId],
      );
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.deleteAuthorsAndCategories(id);

    await this.dbService.item(
      `
        DELETE FROM books
        WHERE id = $1
      `,
      [id],
    );

    return id;
  }
}
