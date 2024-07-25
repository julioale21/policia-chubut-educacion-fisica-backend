import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { ExerciseCategory } from 'src/common/enums/excersises-category.enum';

export class CreateExcerciseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsPositive()
  @IsOptional()
  duration?: number;

  @IsPositive()
  @IsOptional()
  repetitions?: number;

  @IsNotEmpty()
  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;

  @IsPositive()
  @IsNotEmpty()
  restTimeBetweenSets: number;
}
