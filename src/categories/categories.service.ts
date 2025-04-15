import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DBService } from '../db/db.service';
import { Category } from './entities/category.entity';
import { useFilters } from '../../shared/utils/useFilters';
import { ilike } from '../../shared/utils/ilike';

@Injectable()
export class CategoriesService {
  constructor(private readonly dbService: DBService) {}

  async create({ name, description, color }: CreateCategoryDto) {
    return this.dbService.create(
      'INSERT INTO categories (name, description, color) VALUES ($1, $2, $3)',
      [name, description, color],
    );
  }

  findAll(options?: { filters?: { search?: string } }) {
    const [filtersSection, filtersParams] = useFilters(options?.filters, {
      search: ['name LIKE $1', [ilike(options?.filters?.search)]],
    });

    return this.dbService.query<Category>(
      `SELECT * FROM categories ${filtersSection}`,
      [...filtersParams],
    );
  }

  private findOne(id: number) {
    return this.dbService.item('SELECT * FROM categories WHERE id = $1', [id]);
  }

  async update(id: number, { name, description, color }: UpdateCategoryDto) {
    await this.dbService.item(
      `
        UPDATE categories 
        SET name = $2, description = $3, color = $4
        WHERE id = $1
      `,
      [id, name, description, color],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.dbService.item(
      `
        DELETE FROM categories
        WHERE id = $1
      `,
      [id],
    );

    return id;
  }
}
