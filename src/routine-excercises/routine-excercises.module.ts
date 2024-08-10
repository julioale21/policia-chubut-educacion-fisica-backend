import { Module } from '@nestjs/common';
import { RoutineExcercisesService } from './routine-excercises.service';
import { RoutineExcercisesController } from './routine-excercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineExercise } from './entities/routine-excercise.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { Exercise } from 'src/excercises/entities/excercise.entity';

@Module({
  controllers: [RoutineExcercisesController],
  providers: [RoutineExcercisesService],
  imports: [TypeOrmModule.forFeature([RoutineExercise, Routine, Exercise])],
})
export class RoutineExcercisesModule {}
