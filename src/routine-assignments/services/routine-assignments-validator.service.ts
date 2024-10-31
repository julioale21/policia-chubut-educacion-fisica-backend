import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Routine } from 'src/routines/entities/routine.entity';

@Injectable()
export class RoutineAssignmentValidatorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
  ) {}

  async validateEntities(studentId: string, routineId: string) {
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${studentId}" not found`);
    }

    const routine = await this.routineRepository.findOne({
      where: { id: routineId },
    });
    if (!routine) {
      throw new NotFoundException(`Routine with ID "${routineId}" not found`);
    }

    return { student, routine };
  }
}
