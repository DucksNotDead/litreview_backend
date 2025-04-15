import { Body, Controller, Post, Res } from '@nestjs/common';
import { AccountService } from './account.service';
import { Public } from '../../shared/decorators/public';
import { Response } from 'express';
import { AccountLoginDto } from './dto/account-login.dto';
import { Account } from '../../shared/decorators/account';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return this.accountService.register(createUserDto, res);
  }

  @Public()
  @Post('login')
  async login(@Body() credits: AccountLoginDto, @Res() res: Response) {
    const user = await this.accountService.validateUser(credits);

    this.accountService.login(user, res);

    return res.json(user);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    return this.accountService.logout(res);
  }

  @Post()
  async authenticate(@Account() account?: User) {
    return account;
  }

  @Public()
  @Post('hash-passwords')
  async hashPasswords() {
    await this.accountService.hashAllPasswords();
  }
}
