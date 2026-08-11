import React from "react";
import { AuthLayout } from "../../../../components/shared/auth/AuthLayout";
import { AuthCard } from "../../../../components/shared/auth/AuthCard";
import { SignupForm } from "../../../../components/shared/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Create an account"
        subtitle="Join your institution's platform today."
      >
        <SignupForm />
      </AuthCard>
    </AuthLayout>
  );
}
