import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './jwt.strategy';
import { AccountGuard } from './account.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mysecret',
      signOptions: { expiresIn: '72h' },
    }),
    UsersModule,
  ],
  providers: [
    AccountService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: AccountGuard }, // Глобальная аутентификация
  ],
  controllers: [AccountController],
})
export class AccountModule {}
