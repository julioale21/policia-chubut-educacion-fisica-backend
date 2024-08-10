import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseCompletionDto } from './dto/create-exercise-completion.dto';
import { UpdateExerciseCompletionDto } from './dto/update-exercise-completion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ExerciseCompletion } from './entities/exercise-completion.entity';
import { Exercise } from 'src/excercises/entities/excercise.entity';
import { DataSource, Repository } from 'typeorm';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';

@Injectable()
export class ExerciseCompletionsService {
  constructor(
    @InjectRepository(ExerciseCompletion)
    private exerciseCompletionRepository: Repository<ExerciseCompletion>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(RoutineAssignment)
    private routineAssignmentRepository: Repository<RoutineAssignment>,
    private dataSource: DataSource,
  ) {}

  async create(
    createExerciseCompletionDto: CreateExerciseCompletionDto,
  ): Promise<ExerciseCompletion> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { exerciseId, routineAssignmentId, ...completionData } =
        createExerciseCompletionDto;

      const exercise = await this.exerciseRepository.findOne({
        where: { id: exerciseId },
      });
      if (!exercise) {
        throw new NotFoundException(
          `Exercise with ID "${exerciseId}" not found`,
        );
      }

      const routineAssignment = await this.routineAssignmentRepository.findOne({
        where: { id: routineAssignmentId },
      });
      if (!routineAssignment) {
        throw new NotFoundException(
          `RoutineAssignment with ID "${routineAssignmentId}" not found`,
        );
      }

      const newExerciseCompletion = this.exerciseCompletionRepository.create({
        ...completionData,
        completionDate: completionData.completionDate
          ? this.parseDate(completionData.completionDate)
          : null,
        exercise,
        routineAssignment,
      });

      const savedExerciseCompletion = await queryRunner.manager.save(
        newExerciseCompletion,
      );

      await queryRunner.commitTransaction();

      return savedExerciseCompletion;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.exerciseCompletionRepository.find({
      relations: ['exercise', 'routineAssignment'],
    });
  }

  async findOne(id: string) {
    const exerciseCompletion = await this.exerciseCompletionRepository.findOne({
      where: { id },
      relations: ['exercise', 'routineAssignment'],
    });

    if (!exerciseCompletion) {
      throw new NotFoundException(
        `ExerciseCompletion with ID "${id}" not found`,
      );
    }

    return exerciseCompletion;
  }

  async update(
    id: string,
    updateExerciseCompletionDto: UpdateExerciseCompletionDto,
  ): Promise<ExerciseCompletion> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exerciseCompletion =
        await this.exerciseCompletionRepository.findOne({ where: { id } });
      if (!exerciseCompletion) {
        throw new NotFoundException(
          `ExerciseCompletion with ID "${id}" not found`,
        );
      }

      const { exerciseId, routineAssignmentId, ...updateData } =
        updateExerciseCompletionDto;

      // Update relations if provided
      if (exerciseId) {
        const exercise = await this.exerciseRepository.findOne({
          where: { id: exerciseId },
        });
        if (!exercise) {
          throw new NotFoundException(
            `Exercise with ID "${exerciseId}" not found`,
          );
        }
        exerciseCompletion.exercise = exercise;
      }

      if (routineAssignmentId) {
        const routineAssignment =
          await this.routineAssignmentRepository.findOne({
            where: { id: routineAssignmentId },
          });
        if (!routineAssignment) {
          throw new NotFoundException(
            `RoutineAssignment with ID "${routineAssignmentId}" not found`,
          );
        }
        exerciseCompletion.routineAssignment = routineAssignment;
      }

      if (updateData.completionDate) {
        updateData.completionDate = this.parseDate(updateData.completionDate);
      }

      // Update other fields
      Object.assign(exerciseCompletion, updateData);

      const updatedExerciseCompletion =
        await queryRunner.manager.save(exerciseCompletion);

      await queryRunner.commitTransaction();

      return updatedExerciseCompletion;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const exerciseCompletion = await this.exerciseCompletionRepository.findOne({
      where: { id },
    });

    if (!exerciseCompletion) {
      throw new NotFoundException(
        `ExerciseCompletion with ID "${id}" not found`,
      );
    }

    return await this.exerciseCompletionRepository.remove(exerciseCompletion);
  }

  private parseDate(dateString: string): string | null {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
