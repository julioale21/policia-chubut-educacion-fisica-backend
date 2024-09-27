import { IsNotEmpty, IsUUID } from 'class-validator';
import { IsDateFormat } from 'src/common/validators/is-date-format.validator';

export class CreateRoutineAssignmentDto {
  @IsDateFormat()
  @IsNotEmpty()
  startDate: string;

  @IsDateFormat()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  routineId: string;
}
