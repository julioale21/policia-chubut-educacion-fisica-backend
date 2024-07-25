import { IsNotEmpty, IsUUID } from 'class-validator';
import { IsDateFormat } from 'src/common/validators/is-date-format.validator';

export class CreateRoutineAssignmentDto {
  @IsDateFormat()
  startDate: string;

  @IsDateFormat()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  routineId: string;
}
