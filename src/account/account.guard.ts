import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true; // Публичный маршрут

    const isAdminOnly = this.reflector.get<boolean>(
      'isAdmin',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['auth_token'];

    if (!token) return false; // Нет токена — отказ

    try {
      const { email, is_admin } = this.jwtService.verify(token);
      request.user = this.usersService.findByEmail(email);

      return !(isAdminOnly && !is_admin);
    } catch {
      return false; // Ошибка валидации токена
    }
  }
}
