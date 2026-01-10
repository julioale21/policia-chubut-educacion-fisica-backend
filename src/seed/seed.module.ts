import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { User } from 'src/auth/entities/user.entity';
import { Exercise } from 'src/excercises/entities/excercise.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Exercise,
      Routine,
      RoutineExercise,
      RoutineAssignment,
      ExerciseCompletion,
    ]),
  ],
})
export class SeedModule {}
