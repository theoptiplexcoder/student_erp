import React from 'react';
import { AuthLayout } from '../../../../components/shared/auth/AuthLayout';
import { AuthCard } from '../../../../components/shared/auth/AuthCard';
import { LoginForm } from '../../../../components/shared/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard title="Welcome back" subtitle="Sign in to continue.">
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
