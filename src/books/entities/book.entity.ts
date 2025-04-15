import { User } from '../../users/entities/user.entity';
import { Author } from '../../authors/entities/author.entity';
import { Category } from '../../categories/entities/category.entity';

class BookBase {
  id: number;
  title: string;
  description: string | null;
  pages_count: number;
  cover_url: string | null;
  created_date: string;
  published_date: string | null;
}

export class Book extends BookBase {
  creator_id: number | null;
}

export class BookExtended extends BookBase {
  creator: User | null;
  authors: Author[];
  categories: Category[];
  rating: number;
}
