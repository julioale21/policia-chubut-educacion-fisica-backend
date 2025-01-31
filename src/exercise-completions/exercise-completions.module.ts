import { Module } from '@nestjs/common';
import { ExerciseCompletionsService } from './exercise-completions.service';
import { ExerciseCompletionsController } from './exercise-completions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseCompletion } from './entities/exercise-completion.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';

@Module({
  controllers: [ExerciseCompletionsController],
  providers: [ExerciseCompletionsService],
  imports: [
    TypeOrmModule.forFeature([
      ExerciseCompletion,
      RoutineExercise,
      RoutineAssignment,
    ]),
  ],
})
export class ExerciseCompletionsModule {}
