export interface IInstitutionPolicy {
  minimumAttendanceThreshold: number;
  requiresGuardianSignatureForLeave: boolean;
  gradingSystem: 'CGPA' | 'GPA' | 'PERCENTAGE';
}
