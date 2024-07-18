import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineAssignmentDto } from './create-routine-assignment.dto';

export class UpdateRoutineAssignmentDto extends PartialType(CreateRoutineAssignmentDto) {}
