export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED',
}

export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  FACULTY: '/faculty/dashboard',
  STUDENT: '/student/dashboard',
};

export const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
