import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineExerciseDto } from './create-routine-excercise.dto';

export class UpdateRoutineExcerciseDto extends PartialType(
  CreateRoutineExerciseDto,
) {}
