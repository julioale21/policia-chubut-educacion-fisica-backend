import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './entities/routine.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { Exercise } from 'src/excercises/entities/excercise.entity';

@Module({
  controllers: [RoutinesController],
  providers: [RoutinesService],
  imports: [
    TypeOrmModule.forFeature([
      Routine,
      User,
      Exercise,
      RoutineExercise,
      RoutineAssignment,
      ExerciseCompletion,
    ]),
    AuthModule,
  ],
})
export class RoutinesModule {}
