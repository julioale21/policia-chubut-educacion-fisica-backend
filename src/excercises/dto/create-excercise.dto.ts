import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateIf,
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

  @IsOptional()
  @ValidateIf((o) => o.imageUrl !== null && o.imageUrl !== '')
  @IsUrl()
  imageUrl?: string | null;

  @IsNotEmpty()
  @IsEnum(ExerciseCategory)
  category: ExerciseCategory;
}
