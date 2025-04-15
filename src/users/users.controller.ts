import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindUsersDto } from './dto/find-users-dto';
import { Admin } from '../../shared/decorators/admin';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Admin()
  @Get()
  findAll(@Query() query?: FindUsersDto) {
    return this.usersService.findAll({ filters: query });
  }

  @Admin()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
