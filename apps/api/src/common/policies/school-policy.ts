import { IInstitutionPolicy } from './institution-policy.interface';

export class SchoolPolicy implements IInstitutionPolicy {
  minimumAttendanceThreshold = 85;
  requiresGuardianSignatureForLeave = true;
  gradingSystem: 'CGPA' | 'GPA' | 'PERCENTAGE' = 'PERCENTAGE';
}
