import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciseCompletionDto } from './create-exercise-completion.dto';

export class UpdateExerciseCompletionDto extends PartialType(
  CreateExerciseCompletionDto,
) {}
