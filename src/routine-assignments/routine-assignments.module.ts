import { Module } from '@nestjs/common';
import { RoutineAssignmentsService } from './routine-assignments.service';
import { RoutineAssignmentsController } from './routine-assignments.controller';
import { RoutineAssignment } from './entities/routine-assignment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [RoutineAssignmentsController],
  providers: [RoutineAssignmentsService],
  imports: [TypeOrmModule.forFeature([RoutineAssignment])],
})
export class RoutineAssignmentsModule {}
