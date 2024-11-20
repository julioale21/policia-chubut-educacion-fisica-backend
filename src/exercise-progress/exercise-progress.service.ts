// src/exercise-progress/exercise-progress.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { Repository } from 'typeorm';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { ToggleExerciseDto } from './dto/toggle-exercise.dto';

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
  ) {}

  async toggleExercise(toggleExerciseDto: ToggleExerciseDto) {
    const { assignmentId, exerciseId, dayOfRoutine, extras } =
      toggleExerciseDto;

    const existingCompletion = await this.completionRepo.findOne({
      where: {
        routineAssignment: { id: assignmentId },
        exercise: { id: exerciseId },
        dayOfRoutine,
      },
    });

    if (existingCompletion) {
      existingCompletion.isCompleted = !existingCompletion.isCompleted;
      if (extras) {
        Object.assign(existingCompletion, extras);
      }
      return this.completionRepo.save(existingCompletion);
    }

    const completion = this.completionRepo.create({
      routineAssignment: { id: assignmentId },
      exercise: { id: exerciseId },
      dayOfRoutine,
      completionDate: new Date(),
      isCompleted: true,
      ...extras,
    });

    return this.completionRepo.save(completion);
  }

  async getRoutineProgress(assignmentId: string): Promise<RoutineProgress> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: [
        'routine',
        'routine.routineExercises',
        'routine.routineExercises.exercise',
        'exerciseCompletions',
        'exerciseCompletions.exercise',
      ],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

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
        assignment.exerciseCompletions?.some(
          (completion) =>
            completion.exercise.id === ex.exercise.id &&
            completion.dayOfRoutine === parseInt(day) &&
            completion.isCompleted,
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
          isCompleted: assignment.exerciseCompletions?.some(
            (completion) =>
              completion.exercise.id === ex.exercise.id &&
              completion.dayOfRoutine === parseInt(day) &&
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
}
