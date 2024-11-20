import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { ExerciseProgressController } from './exercise-progress.controller';
import { ExerciseProgressService } from './exercise-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseCompletion, RoutineAssignment])],
  controllers: [ExerciseProgressController],
  providers: [ExerciseProgressService],
  exports: [ExerciseProgressService],
})
export class ExerciseProgressModule {}
