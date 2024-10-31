import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { RoutineAssignmentData } from '../interfaces/routine-assignment-data.interface';
import { RoutineAssignment } from '../entities/routine-assignment.entity';
import { DuplicateAssignmentException } from '../exceptions/duplicated-assignment.exception';

@Injectable()
export class RoutineAssignmentErrorHandler {
  handleError(
    err: any,
    assignmentData: RoutineAssignmentData,
    existingAssignment?: RoutineAssignment,
  ) {
    if (err instanceof QueryFailedError) {
      const pgError = err as any;
      if (
        pgError.code === '23505' &&
        pgError.constraint === 'unique_student_routine_dates'
      ) {
        const studentId =
          assignmentData.studentId || existingAssignment?.student.id;
        const routineId =
          assignmentData.routineId || existingAssignment?.routine.id;
        const startDate =
          assignmentData.startDate ||
          existingAssignment?.startDate.toLocaleDateString();
        const endDate =
          assignmentData.endDate ||
          existingAssignment?.endDate.toLocaleDateString();

        if (studentId && routineId && startDate && endDate) {
          throw new DuplicateAssignmentException(
            studentId,
            routineId,
            startDate,
            endDate,
          );
        }
      }
    }
    throw err;
  }
}
