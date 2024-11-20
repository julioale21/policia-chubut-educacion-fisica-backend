// src/exercise-progress/dto/toggle-exercise.dto.ts
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ExerciseExtrasDto {
  @IsOptional()
  @IsNumber()
  actualRepetitions?: number;

  @IsOptional()
  @IsNumber()
  actualDuration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ToggleExerciseDto {
  @IsUUID()
  assignmentId: string;

  @IsUUID()
  exerciseId: string;

  @IsNumber()
  dayOfRoutine: number;

  @IsOptional()
  extras?: ExerciseExtrasDto;
}
