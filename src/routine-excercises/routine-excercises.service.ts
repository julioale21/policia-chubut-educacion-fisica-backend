import { Injectable } from '@nestjs/common';
import { CreateRoutineExcerciseDto } from './dto/create-routine-excercise.dto';
import { UpdateRoutineExcerciseDto } from './dto/update-routine-excercise.dto';

@Injectable()
export class RoutineExcercisesService {
  create(createRoutineExcerciseDto: CreateRoutineExcerciseDto) {
    return 'This action adds a new routineExcercise';
  }

  findAll() {
    return `This action returns all routineExcercises`;
  }

  findOne(id: number) {
    return `This action returns a #${id} routineExcercise`;
  }

  update(id: number, updateRoutineExcerciseDto: UpdateRoutineExcerciseDto) {
    return `This action updates a #${id} routineExcercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} routineExcercise`;
  }
}
