export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
}

export enum InstitutionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum UserStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED',
}

export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  SUPERADMIN: '/superadmin',
  ADMIN: '/admin',
  FACULTY: '/faculty/dashboard',
  STUDENT: '/student',
};

export const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
