import { Exercise } from 'src/excercises/entities/excercise.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoutineExcerciseDto } from './dto/create-routine-excercise.dto';
import { UpdateRoutineExcerciseDto } from './dto/update-routine-excercise.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Routine } from 'src/routines/entities/routine.entity';

@Injectable()
export class RoutineExcercisesService {
  constructor(
    @InjectRepository(RoutineExercise)
    private routineExerciseRepository: Repository<RoutineExercise>,
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private dataSource: DataSource,
  ) {}
  async create(createRoutineExcerciseDto: CreateRoutineExcerciseDto) {
    const {
      routineId,
      excerciseId,
      dayOfRoutine,
      duration,
      repetitions,
      restTimeBetweenSets,
    } = createRoutineExcerciseDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the routine
      const routine = await this.routineRepository.findOne({
        where: { id: routineId },
      });
      if (!routine) {
        throw new NotFoundException(`Routine with ID "${routineId}" not found`);
      }

      // Find the exercise
      const exercise = await this.exerciseRepository.findOne({
        where: { id: excerciseId },
      });
      if (!exercise) {
        throw new NotFoundException(
          `Exercise with ID "${excerciseId}" not found`,
        );
      }

      // Check if the combination already exists
      const existingRoutineExercise =
        await this.routineExerciseRepository.findOne({
          where: {
            routine: { id: routineId },
            exercise: { id: excerciseId },
            dayOfRoutine: dayOfRoutine,
          },
        });

      if (existingRoutineExercise) {
        throw new Error(
          'This exercise is already assigned to this routine for this day',
        );
      }

      // Create new RoutineExercise
      const routineExercise = new RoutineExercise();
      routineExercise.routine = routine;
      routineExercise.exercise = exercise;
      routineExercise.dayOfRoutine = dayOfRoutine;
      routineExercise.duration = duration;
      routineExercise.repetitions = repetitions;
      routineExercise.restTimeBetweenSets = restTimeBetweenSets;

      // Save the new RoutineExercise
      const savedRoutineExercise =
        await queryRunner.manager.save(routineExercise);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedRoutineExercise;
    } catch (err) {
      // If we encounter an error, rollback the changes
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.routineExerciseRepository.find({
      relations: ['routine', 'exercise'],
    });
  }

  findOne(id: string) {
    const routineExercise = this.routineExerciseRepository.findOne({
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
    updateRoutineExcerciseDto: UpdateRoutineExcerciseDto,
  ) {
    const { routineId, excerciseId, dayOfRoutine } = updateRoutineExcerciseDto;

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

      if (routineId && routineId !== routineExercise.routine.id) {
        const newRoutine = await this.routineRepository.findOne({
          where: { id: routineId },
        });
        if (!newRoutine) {
          throw new NotFoundException(
            `Routine with ID "${routineId}" not found`,
          );
        }
        routineExercise.routine = newRoutine;
      }

      if (excerciseId && excerciseId !== routineExercise.exercise.id) {
        const newExercise = await this.exerciseRepository.findOne({
          where: { id: excerciseId },
        });
        if (!newExercise) {
          throw new NotFoundException(
            `Exercise with ID "${excerciseId}" not found`,
          );
        }
        routineExercise.exercise = newExercise;
      }

      if (dayOfRoutine) {
        routineExercise.dayOfRoutine = dayOfRoutine;
      }

      const existingRoutineExercise =
        await this.routineExerciseRepository.findOne({
          where: {
            routine: { id: routineExercise.routine.id },
            exercise: { id: routineExercise.exercise.id },
          },
        });

      if (existingRoutineExercise && existingRoutineExercise.id !== id) {
        throw new Error('This exercise is already assigned to this routine');
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
    const routine = await this.routineExerciseRepository.findOne({
      where: { id },
    });

    if (!routine) {
      throw new NotFoundException(`Routine Exercise with ID "${id}" not found`);
    }

    return this.routineExerciseRepository.remove(routine);
  }
}
