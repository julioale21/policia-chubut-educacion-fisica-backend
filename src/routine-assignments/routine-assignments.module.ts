import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineAssignmentsService } from './services/routine-assignments.service';

import { RoutineAssignmentErrorHandler } from './services/routine-assignment-error-handler.service';
import { RoutineAssignment } from './entities/routine-assignment.entity';
import { User } from 'src/auth/entities/user.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { RoutineAssignmentValidatorService } from './services/routine-assignments-validator.service';
import { RoutineAssignmentsController } from './routine-assignments.controller';

@Module({
  controllers: [RoutineAssignmentsController],
  imports: [TypeOrmModule.forFeature([RoutineAssignment, User, Routine])],
  providers: [
    RoutineAssignmentsService,
    RoutineAssignmentValidatorService,
    RoutineAssignmentErrorHandler,
  ],
  exports: [RoutineAssignmentsService],
})
export class RoutineAssignmentsModule {}
