export class User {
  id: number;
  email: string;
  password?: string;
  fio: string;
  is_admin: boolean;
  description: string | null;
  avatar_url: string | null;
}
