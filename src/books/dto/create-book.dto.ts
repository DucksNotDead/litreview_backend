import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { maxSecondaryLength } from '../../../shared/const';

export class CreateBookDto {
  @IsString()
  @MaxLength(maxSecondaryLength)
  title: string;

  @IsArray()
  author_ids: number[];

  @IsArray()
  category_ids: number[];

  @IsOptional()
  @IsString()
  description: string | null;

  @IsNumber()
  @Min(1)
  pages_count: number;

  @IsOptional()
  @IsString()
  published_date: string | null;
}
