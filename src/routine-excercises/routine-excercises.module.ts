import { Module } from '@nestjs/common';
import { RoutineExcercisesService } from './routine-excercises.service';
import { RoutineExcercisesController } from './routine-excercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineExcercise } from './entities/routine-excercise.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { Excercise } from 'src/excercises/entities/excercise.entity';

@Module({
  controllers: [RoutineExcercisesController],
  providers: [RoutineExcercisesService],
  imports: [TypeOrmModule.forFeature([RoutineExcercise, Routine, Excercise])],
})
export class RoutineExcercisesModule {}
