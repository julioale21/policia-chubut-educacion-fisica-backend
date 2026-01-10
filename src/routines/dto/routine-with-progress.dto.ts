export class RoutineProgressDto {
  completedDays: number;
  totalDays: number;
  percentage: number;
}

export class RoutineAssignmentInfoDto {
  id: string;
  startDate: Date;
  endDate: Date;
}

export class RoutineWithProgressDto {
  id: string;
  name: string;
  description: string;
  durationInDays: number;
  isActive: boolean;
  trainerName: string;
  assignment: RoutineAssignmentInfoDto;
  progress: RoutineProgressDto;
}
