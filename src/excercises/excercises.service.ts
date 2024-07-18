import { Injectable } from '@nestjs/common';
import { CreateExcerciseDto } from './dto/create-excercise.dto';
import { UpdateExcerciseDto } from './dto/update-excercise.dto';

@Injectable()
export class ExcercisesService {
  create(createExcerciseDto: CreateExcerciseDto) {
    return 'This action adds a new excercise';
  }

  findAll() {
    return `This action returns all excercises`;
  }

  findOne(id: number) {
    return `This action returns a #${id} excercise`;
  }

  update(id: number, updateExcerciseDto: UpdateExcerciseDto) {
    return `This action updates a #${id} excercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} excercise`;
  }
}
