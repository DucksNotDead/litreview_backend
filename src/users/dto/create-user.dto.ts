import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { maxPrimaryLength, maxSecondaryLength } from '../../../shared/const';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(maxSecondaryLength)
  email: string;

  @Length(5, maxPrimaryLength)
  @IsString()
  password: string;

  @MaxLength(maxSecondaryLength)
  @IsString()
  fio: string;

  @IsOptional()
  @IsString()
  @MaxLength(maxSecondaryLength)
  description?: string;
}
