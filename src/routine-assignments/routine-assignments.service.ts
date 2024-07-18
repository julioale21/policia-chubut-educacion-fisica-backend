import { Injectable } from '@nestjs/common';
import { CreateRoutineAssignmentDto } from './dto/create-routine-assignment.dto';
import { UpdateRoutineAssignmentDto } from './dto/update-routine-assignment.dto';

@Injectable()
export class RoutineAssignmentsService {
  create(createRoutineAssignmentDto: CreateRoutineAssignmentDto) {
    return 'This action adds a new routineAssignment';
  }

  findAll() {
    return `This action returns all routineAssignments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} routineAssignment`;
  }

  update(id: number, updateRoutineAssignmentDto: UpdateRoutineAssignmentDto) {
    return `This action updates a #${id} routineAssignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} routineAssignment`;
  }
}
