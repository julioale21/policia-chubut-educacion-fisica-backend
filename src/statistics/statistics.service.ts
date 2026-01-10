import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import {
  UserStatisticsDto,
  WeeklyProgressDto,
  RoutineStatsDto,
} from './dto/user-statistics.dto';
import { ExerciseCategory } from 'src/common/enums/excersises-category.enum';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(RoutineAssignment)
    private assignmentRepo: Repository<RoutineAssignment>,
    @InjectRepository(ExerciseCompletion)
    private completionRepo: Repository<ExerciseCompletion>,
    @InjectRepository(RoutineExercise)
    private routineExerciseRepo: Repository<RoutineExercise>,
  ) {}

  async getUserStatistics(userId: string): Promise<UserStatisticsDto> {
    // Get all assignments for the user with related data
    const assignments = await this.assignmentRepo.find({
      where: { student: { id: userId } },
      relations: [
        'routine',
        'routine.routineExercises',
        'routine.routineExercises.exercise',
        'exerciseCompletions',
        'exerciseCompletions.routineExercise',
        'exerciseCompletions.routineExercise.exercise',
      ],
    });

    // Get all completions for the user
    const allCompletions = await this.completionRepo.find({
      where: {
        routineAssignment: { student: { id: userId } },
        isCompleted: true,
      },
      relations: ['routineExercise', 'routineExercise.exercise'],
      order: { completionDate: 'DESC' },
    });

    // Calculate statistics
    const routineStats = this.calculateRoutineStats(assignments);
    const overallProgress = this.calculateOverallProgress(routineStats);
    const { totalDaysCompleted, totalDaysInProgram } =
      this.calculateTotalDays(routineStats);
    const activeRoutines = this.countActiveRoutines(assignments);
    const { currentStreak, longestStreak } =
      this.calculateStreaks(allCompletions);
    const lastWorkoutDate = this.getLastWorkoutDate(allCompletions);
    const categoryProgress = this.calculateCategoryProgress(
      assignments,
      allCompletions,
    );
    const weeklyData = this.calculateWeeklyData(allCompletions);

    return {
      overallProgress,
      totalDaysCompleted,
      totalDaysInProgram,
      activeRoutines,
      currentStreak,
      longestStreak,
      lastWorkoutDate,
      categoryProgress,
      weeklyData,
      routines: routineStats,
    };
  }

  private calculateRoutineStats(
    assignments: RoutineAssignment[],
  ): RoutineStatsDto[] {
    return assignments.map((assignment) => {
      const totalDays = assignment.routine.durationInDays;
      const completedDays = this.countCompletedDays(assignment);
      const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      const daysRemaining = this.calculateDaysRemaining(assignment.endDate);

      // Get predominant category from exercises
      const category = this.getPredominantCategory(
        assignment.routine.routineExercises,
      );

      return {
        id: assignment.id,
        name: assignment.routine.name,
        category,
        progress: Math.round(progress),
        completedDays,
        totalDays,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        daysRemaining,
      };
    });
  }

  private countCompletedDays(assignment: RoutineAssignment): number {
    const exercisesByDay: Record<number, string[]> = {};

    // Group exercises by day
    assignment.routine.routineExercises?.forEach((re) => {
      if (!exercisesByDay[re.dayOfRoutine]) {
        exercisesByDay[re.dayOfRoutine] = [];
      }
      exercisesByDay[re.dayOfRoutine].push(re.id);
    });

    // Count days where all exercises are completed
    const completedExerciseIds = new Set(
      assignment.exerciseCompletions
        ?.filter((c) => c.isCompleted && c.routineExercise)
        .map((c) => c.routineExercise.id) || [],
    );

    let completedDays = 0;
    Object.values(exercisesByDay).forEach((dayExercises) => {
      const allCompleted = dayExercises.every((exId) =>
        completedExerciseIds.has(exId),
      );
      if (allCompleted) completedDays++;
    });

    return completedDays;
  }

  private getPredominantCategory(exercises: RoutineExercise[]): string {
    if (!exercises || exercises.length === 0) return 'General';

    const categoryCount: Record<string, number> = {};
    exercises.forEach((re) => {
      if (re.exercise?.category) {
        const cat = re.exercise.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    });

    const entries = Object.entries(categoryCount);
    if (entries.length === 0) return 'General';

    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  private calculateDaysRemaining(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  private calculateOverallProgress(routines: RoutineStatsDto[]): number {
    if (routines.length === 0) return 0;
    const sum = routines.reduce((acc, r) => acc + r.progress, 0);
    return Math.round(sum / routines.length);
  }

  private calculateTotalDays(routines: RoutineStatsDto[]): {
    totalDaysCompleted: number;
    totalDaysInProgram: number;
  } {
    const totalDaysCompleted = routines.reduce(
      (acc, r) => acc + r.completedDays,
      0,
    );
    const totalDaysInProgram = routines.reduce(
      (acc, r) => acc + r.totalDays,
      0,
    );
    return { totalDaysCompleted, totalDaysInProgram };
  }

  private countActiveRoutines(assignments: RoutineAssignment[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return assignments.filter((a) => {
      const start = new Date(a.startDate);
      const end = new Date(a.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return start <= today && end >= today;
    }).length;
  }

  private calculateStreaks(completions: ExerciseCompletion[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates with completions
    const completionDates = new Set<string>();
    completions.forEach((c) => {
      if (c.completionDate) {
        const date = new Date(c.completionDate);
        completionDates.add(date.toISOString().split('T')[0]);
      }
    });

    const sortedDates = Array.from(completionDates).sort().reverse();

    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completionDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Check if yesterday had a workout (allow 1 day gap for current streak)
        if (currentStreak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (completionDates.has(yesterdayStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let streak = 0;
    let prevDate: Date | null = null;

    sortedDates.reverse().forEach((dateStr) => {
      const date = new Date(dateStr);
      if (prevDate === null) {
        streak = 1;
      } else {
        const diff =
          (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      prevDate = date;
    });
    longestStreak = Math.max(longestStreak, streak);

    return { currentStreak, longestStreak };
  }

  private getLastWorkoutDate(completions: ExerciseCompletion[]): Date | null {
    if (completions.length === 0) return null;

    const validCompletions = completions.filter((c) => c.completionDate);
    if (validCompletions.length === 0) return null;

    return new Date(validCompletions[0].completionDate);
  }

  private calculateCategoryProgress(
    assignments: RoutineAssignment[],
    completions: ExerciseCompletion[],
  ): Record<string, number> {
    const categoryStats: Record<string, { total: number; completed: number }> =
      {};

    // Initialize all categories
    Object.values(ExerciseCategory).forEach((cat) => {
      categoryStats[cat] = { total: 0, completed: 0 };
    });

    // Count total exercises per category
    assignments.forEach((assignment) => {
      assignment.routine.routineExercises?.forEach((re) => {
        if (re.exercise?.category) {
          categoryStats[re.exercise.category].total++;
        }
      });
    });

    // Count completed exercises per category
    completions.forEach((c) => {
      if (c.routineExercise?.exercise?.category) {
        categoryStats[c.routineExercise.exercise.category].completed++;
      }
    });

    // Calculate percentages
    const result: Record<string, number> = {};
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.total > 0) {
        result[category] = Math.round((stats.completed / stats.total) * 100);
      }
    });

    return result;
  }

  private calculateWeeklyData(
    completions: ExerciseCompletion[],
  ): WeeklyProgressDto[] {
    const result: WeeklyProgressDto[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const exercisesCompleted = completions.filter((c) => {
        if (!c.completionDate) return false;
        const compDate = new Date(c.completionDate);
        return compDate.toISOString().split('T')[0] === dateStr;
      }).length;

      // Get day of week (1 = Monday, 7 = Sunday)
      let dayOfWeek = date.getDay();
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

      result.push({
        date,
        exercisesCompleted,
        dayOfWeek,
      });
    }

    return result;
  }
}
