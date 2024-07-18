import { Module } from '@nestjs/common';
import { RoutineExcercisesService } from './routine-excercises.service';
import { RoutineExcercisesController } from './routine-excercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineExcercise } from './entities/routine-excercise.entity';

@Module({
  controllers: [RoutineExcercisesController],
  providers: [RoutineExcercisesService],
  imports: [TypeOrmModule.forFeature([RoutineExcercise])],
})
export class RoutineExcercisesModule {}
