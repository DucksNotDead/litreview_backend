import { IsOptional, IsString, MaxLength } from 'class-validator';
import { maxSecondaryLength } from '../../../shared/const';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(maxSecondaryLength)
  fio: string;

  @IsOptional()
  @IsString()
  @MaxLength(maxSecondaryLength)
  description?: string | null;
}
