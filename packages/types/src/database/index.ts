export interface Institution {
  id: string;
  legalName: string;
  displayName: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  authUserId: string;
  institutionId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  photoUrl?: string;
}

export interface Faculty {
  id: string;
  institutionId: string;
  userId: string;
  departmentId: string;
  teacherCode: string;
  employmentType: string;
  hireDate: string;
  status: string;
}

export interface Student {
  id: string;
  institutionId: string;
  userId: string;
  admissionNumber?: string;
  studentCode?: string;
  lifecycleStatus: string;
  programId?: string;
  createdAt?: string;
}
