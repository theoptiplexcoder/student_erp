import { Injectable } from '@nestjs/common';
import { InstitutionType } from '@prisma/client';
import { IInstitutionPolicy } from './institution-policy.interface';
import { SchoolPolicy } from './school-policy';
import { CollegePolicy } from './college-policy';
import { UniversityPolicy } from './university-policy';

@Injectable()
export class PolicyFactory {
  getPolicy(institutionType: InstitutionType): IInstitutionPolicy {
    switch (institutionType) {
      case InstitutionType.SCHOOL:
        return new SchoolPolicy();
      case InstitutionType.COLLEGE:
        return new CollegePolicy();
      case InstitutionType.UNIVERSITY:
        return new UniversityPolicy();
      default:
        throw new Error(`Policy not found for institution type: ${institutionType}`);
    }
  }
}
