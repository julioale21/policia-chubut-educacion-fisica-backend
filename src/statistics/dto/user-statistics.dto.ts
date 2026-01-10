export class WeeklyProgressDto {
  date: Date;
  exercisesCompleted: number;
  dayOfWeek: number; // 1-7 (1 = Monday, 7 = Sunday)
}

export class RoutineStatsDto {
  id: string;
  name: string;
  category: string;
  progress: number;
  completedDays: number;
  totalDays: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
}

export class UserStatisticsDto {
  overallProgress: number;
  totalDaysCompleted: number;
  totalDaysInProgram: number;
  activeRoutines: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
  categoryProgress: Record<string, number>;
  weeklyData: WeeklyProgressDto[];
  routines: RoutineStatsDto[];
}
