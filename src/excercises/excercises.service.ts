import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateExcerciseDto } from './dto/create-excercise.dto';
import { UpdateExcerciseDto } from './dto/update-excercise.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Excercise } from './entities/excercise.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExcercisesService {
  private readonly logger = new Logger(ExcercisesService.name);
  constructor(
    @InjectRepository(Excercise)
    private readonly excercisesRepository: Repository<Excercise>,
  ) {}
  async create(createExcerciseDto: CreateExcerciseDto) {
    try {
      const exercise = this.excercisesRepository.create(createExcerciseDto);

      return await this.excercisesRepository.save(exercise);
    } catch (error) {
      this.logger.error(error.message);
      throw new UnprocessableEntityException(error.message);
    }
  }

  findAll() {
    return this.excercisesRepository.find();
  }

  async findOne(id: string) {
    const excercise = await this.excercisesRepository.findOne({
      where: { id },
    });

    if (!excercise) {
      throw new UnprocessableEntityException('Excercise not found');
    }

    return excercise;
  }

  async update(id: string, updateExcerciseDto: UpdateExcerciseDto) {
    const excercise = await this.excercisesRepository.findOne({
      where: { id },
    });

    if (!excercise) {
      throw new UnprocessableEntityException('Excercise not found');
    }

    const updatedExercise = Object.assign(excercise, updateExcerciseDto);

    await this.excercisesRepository.save(updatedExercise);

    return updatedExercise;
  }

  async remove(id: string) {
    const excercise = await this.excercisesRepository.findOne({
      where: { id },
    });

    if (!excercise) {
      throw new UnprocessableEntityException('Excercise not found');
    }

    return await this.excercisesRepository.remove(excercise);
  }
}
