import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DBService } from '../db/db.service';
import { User } from './entities/user.entity';
import { FindUsersDto } from './dto/find-users-dto';
import { useFilters } from '../../shared/utils/useFilters';
import { ilike } from '../../shared/utils/ilike';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DBService) {}

  create({ email, password, fio, description }: CreateUserDto) {
    return this.dbService.create<User>(
      `
        INSERT INTO users (email, password, fio, is_admin, description)
        VALUES ($1, $2, $3, false, $4)
      `,
      [email, password, fio, description],
    );
  }

  findAll(options?: { filters?: FindUsersDto }) {
    const [filtersSection, filtersParams] = useFilters(options?.filters, {
      emailOrFio: [
        'email LIKE $1 OR fio LIKE $1',
        [ilike(options?.filters?.emailOrFio)],
      ],
      isAdmin: ['is_admin = $1', [options?.filters?.isAdmin]],
    });

    return this.dbService.query<User>(
      `SELECT id, email, fio, is_admin, description, avatar_url FROM users ${filtersSection}`,
      [...filtersParams],
    );
  }

  findOne(id: number) {
    return this.dbService.item('SELECT * FROM users WHERE id = $1', [id]);
  }

  findAllForPasswords() {
    return this.dbService.query<Required<User>>('SELECT * FROM users');
  }

  findByEmail(email: string): Promise<Required<User>> {
    return this.dbService.item('SELECT * FROM users WHERE email = $1', [email]);
  }

  async update(id: number, { fio, description }: UpdateUserDto) {
    await this.dbService.item(
      `
        UPDATE users
        SET fio = $2, description = $3
        WHERE id = $1
      `,
      [id, fio, description],
    );

    return this.findOne(id);
  }

  async updatePassword(id: number, password: string) {
    await this.dbService.item(
      `
        UPDATE users
        SET password = $2
        WHERE id = $1
      `,
      [id, password],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.dbService.item('DELETE FROM users WHERE id = $1', [id]);

    return id;
  }
}
