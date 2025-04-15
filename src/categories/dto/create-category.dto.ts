import { Length } from 'class-validator';
import {
  maxColorLength,
  maxPrimaryLength,
  maxSecondaryLength,
} from '../../../shared/const';

export class CreateCategoryDto {
  @Length(1, maxPrimaryLength)
  name: string;

  @Length(0, maxSecondaryLength)
  description: string;

  @Length(0, maxColorLength)
  color: string;
}
