import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Repository } from 'typeorm';
import { Routine } from './entities/routine.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoutinesService {
  private readonly logger = new Logger('RoutinesService');
  constructor(
    @InjectRepository(Routine)
    private routinesRepository: Repository<Routine>,
  ) {}

  async create(createRoutineDto: CreateRoutineDto) {
    try {
      const routine = this.routinesRepository.create(createRoutineDto);
      await this.routinesRepository.save(routine);
      return routine;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    return this.routinesRepository.find();
  }

  async findOne(id: string) {
    const routine = await this.routinesRepository.findOne({ where: { id } });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    return routine;
  }

  update(id: number, updateRoutineDto: UpdateRoutineDto) {
    return `This action updates a #${id} routine`;
  }

  remove(id: number) {
    return `This action removes a #${id} routine`;
  }
}
