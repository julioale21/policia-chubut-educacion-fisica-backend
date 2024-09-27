import { UpdateRoutineExcerciseDto } from './dto/update-routine-excercise.dto';

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Routine } from 'src/routines/entities/routine.entity';
import { RoutineExercise } from './entities/routine-excercise.entity';
import { Exercise } from 'src/excercises/entities/excercise.entity';
import { CreateRoutineExerciseDto } from './dto/create-routine-excercise.dto';

@Injectable()
export class RoutineExercisesService {
  constructor(
    @InjectRepository(RoutineExercise)
    private routineExerciseRepository: Repository<RoutineExercise>,
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private dataSource: DataSource,
  ) {}

  async create(
    routineId: string,
    createRoutineExerciseDto: CreateRoutineExerciseDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const routine = await this.routineRepository.findOne({
        where: { id: routineId },
      });
      if (!routine) {
        throw new NotFoundException(`Routine with ID "${routineId}" not found`);
      }

      const exercise = await this.exerciseRepository.findOne({
        where: { id: createRoutineExerciseDto.exerciseId },
      });
      if (!exercise) {
        throw new NotFoundException(
          `Exercise with ID "${createRoutineExerciseDto.exerciseId}" not found`,
        );
      }

      const existingRoutineExercise =
        await this.routineExerciseRepository.findOne({
          where: {
            routine: { id: routineId },
            exercise: { id: createRoutineExerciseDto.exerciseId },
            dayOfRoutine: createRoutineExerciseDto.dayOfRoutine,
          },
        });

      if (existingRoutineExercise) {
        throw new ConflictException(
          'This exercise is already assigned to this routine for this day',
        );
      }

      const routineExercise = this.routineExerciseRepository.create({
        ...createRoutineExerciseDto,
        routine,
        exercise,
      });

      const savedRoutineExercise =
        await queryRunner.manager.save(routineExercise);

      await queryRunner.commitTransaction();

      return savedRoutineExercise;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.routineExerciseRepository.find({
      relations: ['routine', 'exercise'],
    });
  }

  async findOne(id: string) {
    const routineExercise = await this.routineExerciseRepository.findOne({
      where: { id },
      relations: ['routine', 'exercise'],
    });

    if (!routineExercise) {
      throw new NotFoundException(`Routine Exercise with ID "${id}" not found`);
    }

    return routineExercise;
  }

  async update(
    id: string,
    updateRoutineExerciseDto: UpdateRoutineExcerciseDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const routineExercise = await this.routineExerciseRepository.findOne({
        where: { id },
        relations: ['routine', 'exercise'],
      });

      if (!routineExercise) {
        throw new NotFoundException(
          `RoutineExercise with ID "${id}" not found`,
        );
      }

      if (
        updateRoutineExerciseDto.exerciseId &&
        updateRoutineExerciseDto.exerciseId !== routineExercise.exercise.id
      ) {
        const newExercise = await this.exerciseRepository.findOne({
          where: { id: updateRoutineExerciseDto.exerciseId },
        });
        if (!newExercise) {
          throw new NotFoundException(
            `Exercise with ID "${updateRoutineExerciseDto.exerciseId}" not found`,
          );
        }
        routineExercise.exercise = newExercise;
      }

      Object.assign(routineExercise, updateRoutineExerciseDto);

      const existingRoutineExercise =
        await this.routineExerciseRepository.findOne({
          where: {
            routine: { id: routineExercise.routine.id },
            exercise: { id: routineExercise.exercise.id },
            dayOfRoutine: routineExercise.dayOfRoutine,
          },
        });

      if (existingRoutineExercise && existingRoutineExercise.id !== id) {
        throw new ConflictException(
          'This exercise is already assigned to this routine for this day',
        );
      }

      const updatedRoutineExercise =
        await queryRunner.manager.save(routineExercise);

      await queryRunner.commitTransaction();

      return updatedRoutineExercise;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const routineExercise = await this.routineExerciseRepository.findOne({
      where: { id },
    });

    if (!routineExercise) {
      throw new NotFoundException(`Routine Exercise with ID "${id}" not found`);
    }

    return this.routineExerciseRepository.remove(routineExercise);
  }
}
