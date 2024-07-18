import { Injectable } from '@nestjs/common';
import { CreateExerciseCompletionDto } from './dto/create-exercise-completion.dto';
import { UpdateExerciseCompletionDto } from './dto/update-exercise-completion.dto';

@Injectable()
export class ExerciseCompletionsService {
  create(createExerciseCompletionDto: CreateExerciseCompletionDto) {
    return 'This action adds a new exerciseCompletion';
  }

  findAll() {
    return `This action returns all exerciseCompletions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exerciseCompletion`;
  }

  update(id: number, updateExerciseCompletionDto: UpdateExerciseCompletionDto) {
    return `This action updates a #${id} exerciseCompletion`;
  }

  remove(id: number) {
    return `This action removes a #${id} exerciseCompletion`;
  }
}
