import { Module } from '@nestjs/common';
import { ExerciseCompletionsService } from './exercise-completions.service';
import { ExerciseCompletionsController } from './exercise-completions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseCompletion } from './entities/exercise-completion.entity';
import { Excercise } from 'src/excercises/entities/excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';

@Module({
  controllers: [ExerciseCompletionsController],
  providers: [ExerciseCompletionsService],
  imports: [
    TypeOrmModule.forFeature([
      ExerciseCompletion,
      Excercise,
      RoutineAssignment,
    ]),
  ],
})
export class ExerciseCompletionsModule {}
