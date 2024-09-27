import { CreateRoutineExerciseDto } from './../../routine-excercises/dto/create-routine-excercise.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  durationInDays: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  routineExercises: CreateRoutineExerciseDto[];
}
