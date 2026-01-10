import { RoutineWithProgressDto } from './routine-with-progress.dto';

export class ExerciseCompletionInfoDto {
  id: string;
  isCompleted: boolean;
  completionDate: Date | null;
  actualRepetitions?: number;
  actualDuration?: number;
  notes?: string;
}

export class ExerciseInfoDto {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  category: string;
}

export class RoutineDayExerciseDto {
  id: string;
  order: number;
  sets?: number;
  repetitions?: number;
  duration?: number;
  restTimeBetweenSets?: number;
  exercise: ExerciseInfoDto;
  completion?: ExerciseCompletionInfoDto;
}

export class RoutineDayDto {
  dayNumber: number;
  date: Date;
  exercises: RoutineDayExerciseDto[];
}

export class RoutineDetailDto extends RoutineWithProgressDto {
  days: RoutineDayDto[];
}
