import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoutineAssignmentDto } from './dto/create-routine-assignment.dto';
import { UpdateRoutineAssignmentDto } from './dto/update-routine-assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoutineAssignment } from './entities/routine-assignment.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Routine } from 'src/routines/entities/routine.entity';

@Injectable()
export class RoutineAssignmentsService {
  constructor(
    @InjectRepository(RoutineAssignment)
    private readonly routineAssignmentRepository: Repository<RoutineAssignment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    private dataSource: DataSource,
  ) {}
  async create(
    createRoutineAssignmentDto: CreateRoutineAssignmentDto,
  ): Promise<RoutineAssignment> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { routineId, userId, startDate, endDate } =
        createRoutineAssignmentDto;

      const user = await this.userRepository.findOne({ where: { id: userId } });
      const routine = await this.routineRepository.findOne({
        where: { id: routineId },
      });

      if (!user || !routine) {
        throw new NotFoundException('User or Routine not found');
      }

      const routineAssignment = new RoutineAssignment();
      routineAssignment.user = user;
      routineAssignment.routine = routine;
      routineAssignment.startDate = this.parseDate(startDate);
      routineAssignment.endDate = this.parseDate(endDate);

      const savedAssignment = await queryRunner.manager.save(routineAssignment);

      await queryRunner.commitTransaction();

      return savedAssignment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.routineAssignmentRepository.find({
      relations: ['user', 'routine'],
    });
  }

  findOne(id: string) {
    const routine_assingment = this.routineAssignmentRepository.findOne({
      where: { id: id },
      relations: ['user', 'routine'],
    });

    if (!routine_assingment) {
      throw new NotFoundException('Routine Assignment not found');
    }

    return routine_assingment;
  }

  async update(
    id: string,
    updateRoutineAssignmentDto: UpdateRoutineAssignmentDto,
  ): Promise<RoutineAssignment> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userId, routineId, startDate, endDate } =
        updateRoutineAssignmentDto;

      // Find the existing routine assignment
      const existingAssignment = await queryRunner.manager.findOne(
        RoutineAssignment,
        {
          where: { id },
          relations: ['user', 'routine'],
        },
      );

      if (!existingAssignment) {
        throw new NotFoundException(
          `Routine Assignment with ID "${id}" not found`,
        );
      }

      // Update user if provided
      if (userId) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException(`User with ID "${userId}" not found`);
        }
        existingAssignment.user = user;
      }

      // Update routine if provided
      if (routineId) {
        const routine = await this.routineRepository.findOne({
          where: { id: routineId },
        });
        if (!routine) {
          throw new NotFoundException(
            `Routine with ID "${routineId}" not found`,
          );
        }
        existingAssignment.routine = routine;
      }

      // Update dates if provided
      if (startDate) {
        existingAssignment.startDate = this.parseDate(startDate);
      }
      if (endDate) {
        existingAssignment.endDate = this.parseDate(endDate);
      }

      // Save the updated assignment
      const updatedAssignment =
        await queryRunner.manager.save(existingAssignment);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return updatedAssignment;
    } catch (err) {
      // If we encounter an error, rollback the changes
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} routineAssignment`;
  }

  private parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
}
