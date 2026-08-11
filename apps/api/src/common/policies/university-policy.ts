import { IInstitutionPolicy } from './institution-policy.interface';

export class UniversityPolicy implements IInstitutionPolicy {
  minimumAttendanceThreshold = 85;
  requiresGuardianSignatureForLeave = false;
  gradingSystem: 'CGPA' | 'GPA' | 'PERCENTAGE' = 'GPA';
}
