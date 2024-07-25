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

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  routineId: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  excerciseId: string;
}
