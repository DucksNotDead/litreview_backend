import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindBooksDto } from './dto/find-books.dto';
import { Public } from '../../shared/decorators/public';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Public()
  @Get()
  findAll(@Query() query?: FindBooksDto) {
    const categoryIds =
      query?.categoryIds?.split(',').map((x) => Number(x)) ?? [];
    const authorIds = query?.authorIds?.split(',').map((x) => Number(x)) ?? [];

    return this.booksService.findAll({
      filters: { ...query, categoryIds, authorIds },
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
