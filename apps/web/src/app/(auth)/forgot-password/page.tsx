"use client";

import React, { useState } from "react";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { Button, Input, Label } from "@student-erp/ui";
import { AuthLayout } from "../../../../components/shared/auth/AuthLayout";
import { AuthCard } from "../../../../components/shared/auth/AuthCard";
import { createClient } from "../../../../src/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

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
          <div className="w-full text-center space-y-4">
            <div className="p-4 rounded-md bg-primary/10 text-primary text-sm">
              Check your email for the reset link.
            </div>
            <a
              href="/login"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <Mail className="size-4" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@institution.edu"
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 size-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
              {!isLoading && <ArrowRight className="ml-2 size-4" />}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a href="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </a>
            </p>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
