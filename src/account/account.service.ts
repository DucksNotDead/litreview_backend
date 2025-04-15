import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Response } from 'express';
import { AccountLoginDto } from './dto/account-login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async hashAllPasswords() {
    const users = await this.usersService.findAllForPasswords();
    for (const user of users) {
      await this.usersService.updatePassword(
        user.id,
        await this.hashPassword(user.password),
      );
    }
  }

  async validateUser({ email, password }: AccountLoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register({ password, ...dto }: CreateUserDto, res: Response) {
    const hashedPassword = await this.hashPassword(password);
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    this.login(user, res);

    return res.json(user);
  }

  login(user: User, res: Response) {
    const payload = {
      sub: user.id,
      email: user.email,
      is_admin: user.is_admin,
    };
    const token = this.jwtService.sign(payload);

    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 72 часа
    });
  }

  async logout(res: any) {
    res.clearCookie('auth_token');
    return res.json({});
  }
}
