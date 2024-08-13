import { Module } from '@nestjs/common';
import { RoutineAssignmentsService } from './routine-assignments.service';
import { RoutineAssignmentsController } from './routine-assignments.controller';
import { RoutineAssignment } from './entities/routine-assignment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Routine } from 'src/routines/entities/routine.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  controllers: [RoutineAssignmentsController],
  providers: [RoutineAssignmentsService],
  imports: [TypeOrmModule.forFeature([RoutineAssignment, User, Routine])],
  exports: [TypeOrmModule, RoutineAssignmentsService],
})
export class RoutineAssignmentsModule {}
