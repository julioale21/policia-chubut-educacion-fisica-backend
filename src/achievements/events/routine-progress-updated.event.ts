export class RoutineProgressUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly assignmentId: string,
    public readonly completionPercentage: number,
    public readonly routineName: string,
  ) {}
}
