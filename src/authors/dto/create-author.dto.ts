import {
  IsDate,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { maxSecondaryLength } from '../../../shared/const';

export class CreateAuthorDto {
  @IsString()
  @Length(1, maxSecondaryLength)
  fio: string;

  @IsOptional()
  @IsString()
  @MaxLength(maxSecondaryLength)
  description?: string | null;

  @IsOptional()
  birth_date?: string | null;

  @IsOptional()
  death_date?: string | null;
}
