import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './entities/routine.entity';

@Module({
  controllers: [RoutinesController],
  providers: [RoutinesService],
  imports: [TypeOrmModule.forFeature([Routine])],
})
export class RoutinesModule {}
