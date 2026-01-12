export class ExerciseCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly assignmentId: string,
    public readonly routineExerciseId: string,
    public readonly isCompleted: boolean,
    public readonly completionDate: Date,
  ) {}
}
