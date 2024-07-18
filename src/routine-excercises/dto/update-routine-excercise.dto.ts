import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineExcerciseDto } from './create-routine-excercise.dto';

export class UpdateRoutineExcerciseDto extends PartialType(CreateRoutineExcerciseDto) {}
