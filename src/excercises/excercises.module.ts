import { Module } from '@nestjs/common';
import { ExcercisesService } from './excercises.service';
import { ExcercisesController } from './excercises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Excercise } from './entities/excercise.entity';

@Module({
  controllers: [ExcercisesController],
  providers: [ExcercisesService],
  imports: [TypeOrmModule.forFeature([Excercise])],
})
export class ExcercisesModule {}
