export class StudentAdmittedEvent {
  constructor(
    public readonly institutionId: string,
    public readonly studentId: string,
    public readonly academicYearId: string,
    public readonly programId?: string,
    public readonly authUserId?: string,
    public readonly feePlanData?: any,
    public readonly studentData?: any,
  ) {}
}
