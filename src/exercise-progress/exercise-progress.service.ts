import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { Repository } from 'typeorm';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { ToggleExerciseDto } from './dto/toggle-exercise.dto';
import { ACHIEVEMENT_EVENTS } from '../achievements/constants/achievement-events';
import { ExerciseCompletedEvent } from '../achievements/events/exercise-completed.event';
import { RoutineProgressUpdatedEvent } from '../achievements/events/routine-progress-updated.event';

export interface ExercisesByDay {
  [key: string]: RoutineExercise[];
}

export interface DayProgress {
  totalExercises: number;
  completedExercises: number;
  isDayCompleted: boolean;
  exercises: (RoutineExercise & { isCompleted: boolean })[];
}

export interface Progress {
  [key: string]: DayProgress;
}

export interface RoutineProgress {
  totalDays: number;
  completedDays: number;
  progress: Progress;
  percentage: number;
}

@Injectable()
export class ExerciseProgressService {
  constructor(
    @InjectRepository(ExerciseCompletion)
    private completionRepo: Repository<ExerciseCompletion>,
    @InjectRepository(RoutineAssignment)
    private assignmentRepo: Repository<RoutineAssignment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async toggleExercise(toggleExerciseDto: ToggleExerciseDto, userId: string) {
    const { assignmentId, routineExerciseId, extras } = toggleExerciseDto;

    const existingCompletion = await this.completionRepo.findOne({
      where: {
        routineAssignment: { id: assignmentId },
        routineExercise: { id: routineExerciseId },
      },
      relations: ['routineExercise'],
    });

    let savedCompletion: ExerciseCompletion;

    if (existingCompletion) {
      existingCompletion.isCompleted = !existingCompletion.isCompleted;
      if (extras) {
        Object.assign(existingCompletion, extras);
      }
      savedCompletion = await this.completionRepo.save(existingCompletion);
    } else {
      const completion = this.completionRepo.create({
        routineAssignment: { id: assignmentId },
        routineExercise: { id: routineExerciseId },
        completionDate: new Date(),
        isCompleted: true,
        ...extras,
      });
      savedCompletion = await this.completionRepo.save(completion);
    }

    // Emit events for achievement system (async, non-blocking)
    if (savedCompletion.isCompleted) {
      this.eventEmitter.emit(
        ACHIEVEMENT_EVENTS.EXERCISE_COMPLETED,
        new ExerciseCompletedEvent(
          userId,
          assignmentId,
          routineExerciseId,
          true,
          savedCompletion.completionDate || new Date(),
        ),
      );

      // Check routine completion percentage
      const progress = await this.getRoutineProgress(assignmentId);
      if (progress.percentage === 100) {
        const assignment = await this.assignmentRepo.findOne({
          where: { id: assignmentId },
          relations: ['routine'],
        });

        if (assignment?.routine) {
          this.eventEmitter.emit(
            ACHIEVEMENT_EVENTS.ROUTINE_PROGRESS_UPDATED,
            new RoutineProgressUpdatedEvent(
              userId,
              assignmentId,
              100,
              assignment.routine.name,
            ),
          );
        }
      }
    }

    return savedCompletion;
  }

  async getRoutineProgress(assignmentId: string): Promise<RoutineProgress> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: [
        'routine',
        'routine.routineExercises',
        'routine.routineExercises.exercise',
        'exerciseCompletions',
        'exerciseCompletions.routineExercise',
      ],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Filtramos las completions que tienen routineExercise válido
    const validCompletions =
      assignment.exerciseCompletions?.filter(
        (completion) => completion.routineExercise !== null,
      ) || [];

    const exercisesByDay =
      assignment.routine.routineExercises.reduce<ExercisesByDay>((acc, ex) => {
        if (!acc[ex.dayOfRoutine]) {
          acc[ex.dayOfRoutine] = [];
        }
        acc[ex.dayOfRoutine].push(ex);
        return acc;
      }, {});

    const progress: Progress = {};
    let completedDays = 0;

    Object.entries(exercisesByDay).forEach(([day, exercises]) => {
      const completedExercises = exercises.filter((ex) =>
        validCompletions.some(
          (completion) =>
            completion.routineExercise?.id === ex.id && completion.isCompleted,
        ),
      );

      const isDayCompleted = completedExercises.length === exercises.length;
      if (isDayCompleted) completedDays++;

      progress[day] = {
        totalExercises: exercises.length,
        completedExercises: completedExercises.length,
        isDayCompleted,
        exercises: exercises.map((ex) => ({
          ...ex,
          isCompleted: validCompletions.some(
            (completion) =>
              completion.routineExercise?.id === ex.id &&
              completion.isCompleted,
          ),
        })),
      };
    });

    return {
      totalDays: assignment.routine.durationInDays,
      completedDays,
      progress,
      percentage: (completedDays / assignment.routine.durationInDays) * 100,
    };
  }

  // Método auxiliar para limpiar completions huérfanas
  async cleanOrphanCompletions(assignmentId: string) {
    const orphanCompletions = await this.completionRepo.find({
      where: {
        routineAssignment: { id: assignmentId },
        routineExercise: null,
      },
    });

    if (orphanCompletions.length > 0) {
      await this.completionRepo.remove(orphanCompletions);
    }
  }
}
