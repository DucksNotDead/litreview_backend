import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import { maxPrimaryLength, maxSecondaryLength } from '../../../shared/const';

export class AccountLoginDto {
  @IsEmail()
  @MaxLength(maxSecondaryLength)
  email: string;

  @IsString()
  @Length(5, maxPrimaryLength)
  password: string;
}
