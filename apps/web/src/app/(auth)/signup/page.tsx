import React from 'react';
import { AuthLayout } from '../../../../components/shared/auth/AuthLayout';
import { AuthCard } from '../../../../components/shared/auth/AuthCard';
import { SignupForm } from '../../../../components/shared/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Register Your Institution"
        subtitle="Set up your institution workspace and create the primary administrator account."
      >
        <SignupForm />
      </AuthCard>
    </AuthLayout>
  );
}
