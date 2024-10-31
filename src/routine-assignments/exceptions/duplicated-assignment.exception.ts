import { ConflictException } from '@nestjs/common';

export class DuplicateAssignmentException extends ConflictException {
  constructor(
    studentId: string,
    routineId: string,
    startDate: string,
    endDate: string,
  ) {
    super(
      `A routine assignment already exists for student ${studentId} with routine ${routineId} between ${startDate} and ${endDate}`,
    );
  }
}
