'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, KeyRound, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Input, Label } from '@student-erp/ui';
import { AuthLayout } from '../../../../components/shared/auth/AuthLayout';
import { AuthCard } from '../../../../components/shared/auth/AuthCard';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasCode, setHasCode] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError('Invalid or expired reset link.');
        } else {
          setHasCode(true);
        }
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <AuthLayout>
        <AuthCard title="Password updated" subtitle="Your password has been successfully reset.">
          <div className="w-full space-y-4 text-center">
            <CheckCircle className="mx-auto size-12 text-green-500" />
            <p className="text-muted-foreground text-sm">Redirecting to sign in...</p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard title="Reset password" subtitle="Enter your new password below.">
        {!hasCode ? (
          <div className="w-full space-y-4 text-center">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}
            <p className="text-muted-foreground text-sm">Loading reset link...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <div className="text-muted-foreground absolute top-2.5 left-3">
                  <KeyRound className="size-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 pl-9"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <div className="text-muted-foreground absolute top-2.5 left-3">
                  <KeyRound className="size-4" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 pl-9"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 size-5 animate-spin" /> : 'Reset Password'}
              {!isLoading && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <AuthCard title="Reset password" subtitle="Loading...">
            <div className="flex justify-center py-8">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          </AuthCard>
        </AuthLayout>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
