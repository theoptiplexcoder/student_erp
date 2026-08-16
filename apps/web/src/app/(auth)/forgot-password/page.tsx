'use client';

import React, { useState } from 'react';
import { Loader2, Mail, ArrowRight } from 'lucide-react';
import { Button, Input, Label } from '@student-erp/ui';
import { AuthLayout } from '../../../../components/shared/auth/AuthLayout';
import { AuthCard } from '../../../../components/shared/auth/AuthCard';
import { createClient } from '../../../../src/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link."
      >
        {success ? (
          <div className="w-full space-y-4 text-center">
            <div className="bg-primary/10 text-primary rounded-md p-4 text-sm">
              Check your email for the reset link.
            </div>
            <a
              href="/login"
              className="text-primary inline-flex items-center text-sm font-medium hover:underline"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <div className="text-muted-foreground absolute top-2.5 left-3">
                  <Mail className="size-4" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@institution.edu"
                  className="h-11 pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 size-5 animate-spin" /> : 'Send Reset Link'}
              {!isLoading && <ArrowRight className="ml-2 size-4" />}
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Remember your password?{' '}
              <a href="/login" className="text-primary font-semibold hover:underline">
                Sign In
              </a>
            </p>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
