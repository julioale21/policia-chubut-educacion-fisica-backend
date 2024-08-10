import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRoutineExcerciseDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  dayOfRoutine?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  duration?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  repetitions?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  restTimeBetweenSets?: number;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  routineId: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  excerciseId: string;
}
