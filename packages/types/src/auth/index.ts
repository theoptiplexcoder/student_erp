export interface AuthUser {
  id: string;
  authUserId: string;
  institutionId?: string | null;
  role: string;
  status: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}
