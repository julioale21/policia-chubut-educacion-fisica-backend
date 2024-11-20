import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { IsDateFormat } from 'src/common/validators/is-date-format.validator';

export class CreateExerciseCompletionDto {
  @IsDateFormat()
  @IsOptional()
  completionDate?: string;

  @IsPositive()
  @IsOptional()
  actualRepetitions?: number;

  @IsPositive()
  @IsOptional()
  actualDuration?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  routineExerciseId: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  routineAssignmentId: string;
}
