import { IsNumber, IsString, Max, MaxLength, Min } from 'class-validator';
import { maxSecondaryLength } from '../../../shared/const';

export class CreateReviewDto {
  @IsNumber()
  book_id: number;

  @IsString()
  @MaxLength(maxSecondaryLength)
  title: string;

  @IsString()
  body: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  mark: number;
}
