import { IInstitutionPolicy } from './institution-policy.interface';

export class CollegePolicy implements IInstitutionPolicy {
  minimumAttendanceThreshold = 85;
  requiresGuardianSignatureForLeave = false;
  gradingSystem: 'CGPA' | 'GPA' | 'PERCENTAGE' = 'CGPA';
}
