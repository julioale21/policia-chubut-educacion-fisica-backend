import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Routine } from './entities/routine.entity';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';

import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { Exercise } from 'src/excercises/entities/excercise.entity';

@Injectable()
export class RoutinesService {
  private readonly logger = new Logger('RoutinesService');

  constructor(
    @InjectRepository(Routine)
    private routinesRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private routineExerciseRepository: Repository<RoutineExercise>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    private dataSource: DataSource,
  ) {}

  async create(createRoutineDto: CreateRoutineDto, trainer: User) {
    this.logger.log(
      `Attempting to create routine: ${JSON.stringify(createRoutineDto)}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('Creating routine entity');
      const routine = this.routinesRepository.create({
        name: createRoutineDto.name,
        description: createRoutineDto.description,
        durationInDays: createRoutineDto.durationInDays,
        isActive: createRoutineDto.isActive ?? true,
        trainer: { id: trainer.id },
      });

      this.logger.log('Saving routine entity');
      const savedRoutine = await queryRunner.manager.save(routine);
      this.logger.log(`Routine saved with ID: ${savedRoutine.id}`);

      if (
        createRoutineDto.routineExercises &&
        createRoutineDto.routineExercises.length > 0
      ) {
        this.logger.log('Processing routine exercises');
        const routineExercises = createRoutineDto.routineExercises.map(
          (routineExercise) => {
            this.logger.log(
              `Creating routine exercise for exercise ID: ${routineExercise.exerciseId}`,
            );
            return this.routineExerciseRepository.create({
              routine: { id: savedRoutine.id },
              exercise: { id: routineExercise.exerciseId },
              dayOfRoutine: routineExercise.dayOfRoutine,
              duration: routineExercise.duration,
              repetitions: routineExercise.repetitions,
              restTimeBetweenSets: routineExercise.restTimeBetweenSets,
            });
          },
        );

        this.logger.log('Saving routine exercises');
        await queryRunner.manager.save(routineExercises);
      }

      this.logger.log('Committing transaction');
      await queryRunner.commitTransaction();

      this.logger.log(
        `Routine created successfully with ID: ${savedRoutine.id}`,
      );
      return this.findOne(savedRoutine.id);
    } catch (error) {
      // ... error handling ...
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: User) {
    let queryBuilder = this.routinesRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.trainer', 'trainer')
      .leftJoinAndSelect('routine.routineAssignments', 'routineAssignments')
      .leftJoinAndSelect('routineAssignments.student', 'student')
      .loadRelationCountAndMap(
        'routine.exerciseCount',
        'routine.routineExercises',
      );

    // If the user is not an admin, super-user, or trainer, filter routines
    if (
      !user.roles.some((role) =>
        [ValidRoles.admin, ValidRoles.supeUser, ValidRoles.trainer].includes(
          role as ValidRoles,
        ),
      )
    ) {
      queryBuilder = queryBuilder.innerJoin(
        'routineAssignments.student',
        'assignedStudent',
        'assignedStudent.id = :userId',
        { userId: user.id },
      );
    }

    const routines = await queryBuilder.getMany();

    return routines.map((routine) => ({
      id: routine.id,
      name: routine.name,
      description: routine.description,
      durationInDays: routine.durationInDays,
      isActive: routine.isActive,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      trainer: {
        id: routine.trainer.id,
        name: routine.trainer.name,
        email: routine.trainer.email,
      },
      exerciseCount: (routine as any).exerciseCount,
      assignments: routine.routineAssignments.map((assignment) => ({
        id: assignment.id,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        student: {
          id: assignment.student.id,
          name: assignment.student.name,
          email: assignment.student.email,
        },
      })),
      studentCount: routine.routineAssignments.length,
    }));
  }

  async findOne(id: string) {
    const routine = await this.routinesRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.trainer', 'trainer')
      .leftJoinAndSelect('routine.routineExercises', 'routineExercises')
      .leftJoinAndSelect('routineExercises.exercise', 'exercise')
      .leftJoinAndSelect('routine.routineAssignments', 'routineAssignments')
      .leftJoinAndSelect('routineAssignments.student', 'student')
      .leftJoinAndSelect(
        'routineAssignments.exerciseCompletions',
        'exerciseCompletions',
      )
      .leftJoinAndSelect('exerciseCompletions.exercise', 'completedExercise')
      .where('routine.id = :id', { id })
      .getOne();

    if (!routine) {
      throw new NotFoundException(`Routine with ID "${id}" not found`);
    }

    // Transformamos solo los campos necesarios
    return {
      ...routine,
      trainer: {
        id: routine.trainer.id,
        name: routine.trainer.name,
        email: routine.trainer.email,
      },
      routineAssignments: routine.routineAssignments.map((assignment) => ({
        ...assignment,
        student: {
          id: assignment.student.id,
          name: assignment.student.name,
          email: assignment.student.email,
        },
      })),
      studentCount: routine.routineAssignments.length,
    };
  }

  async update(id: string, updateRoutineDto: UpdateRoutineDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const routine = await this.routinesRepository.findOne({
        where: { id },
        relations: ['trainer', 'routineExercises'],
      });

      if (!routine) {
        throw new NotFoundException('Routine not found');
      }

      if (
        routine.trainer.id !== user.id &&
        !user.roles.includes(ValidRoles.admin)
      ) {
        throw new BadRequestException(
          'You are not authorized to update this routine',
        );
      }

      Object.assign(routine, updateRoutineDto);

      if (updateRoutineDto.routineExercises) {
        // Remove existing routine exercises
        await queryRunner.manager.remove(routine.routineExercises);

        // Create new routine exercises without any restrictions
        const newRoutineExercises = await Promise.all(
          updateRoutineDto.routineExercises.map(async (exerciseDto) => {
            const exercise = await this.exerciseRepository.findOne({
              where: { id: exerciseDto.exerciseId },
            });
            if (!exercise) {
              throw new NotFoundException(
                `Exercise with ID ${exerciseDto.exerciseId} not found`,
              );
            }
            return this.routineExerciseRepository.create({
              routine: { id: routine.id },
              exercise: { id: exercise.id },
              dayOfRoutine: exerciseDto.dayOfRoutine,
              duration: exerciseDto.duration,
              repetitions: exerciseDto.repetitions,
              restTimeBetweenSets: exerciseDto.restTimeBetweenSets,
            });
          }),
        );

        await queryRunner.manager.save(newRoutineExercises);
      }

      await queryRunner.manager.save(routine);

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const routine = await this.routinesRepository.findOne({
        where: { id },
        relations: ['routineExercises', 'routineAssignments'],
      });

      if (!routine) {
        throw new NotFoundException('Routine not found');
      }

      // Remove related routine exercises
      if (routine.routineExercises) {
        await queryRunner.manager.remove(routine.routineExercises);
      }

      // Remove related routine assignments and their exercise completions
      if (routine.routineAssignments) {
        for (const assignment of routine.routineAssignments) {
          // Remove exercise completions for each assignment
          await queryRunner.manager.delete(ExerciseCompletion, {
            routineAssignment: { id: assignment.id },
          });
        }
        await queryRunner.manager.remove(routine.routineAssignments);
      }

      // Finally, remove the routine
      await queryRunner.manager.remove(routine);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRoutineWithStudents(id: string) {
    const routine = await this.routinesRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.trainer', 'trainer')
      .leftJoinAndSelect('routine.routineAssignments', 'assignments')
      .leftJoinAndSelect('assignments.student', 'student')
      .leftJoinAndSelect('routine.routineExercises', 'routineExercises')
      .leftJoinAndSelect('routineExercises.exercise', 'exercise')
      .where('routine.id = :id', { id })
      .getOne();

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    return {
      ...routine,
      studentCount: routine.routineAssignments.length,
      students: routine.routineAssignments.map(
        (assignment) => assignment.student,
      ),
    };
  }
}
