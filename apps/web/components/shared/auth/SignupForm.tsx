'use client';

import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button, Input, Label, Checkbox } from '@student-erp/ui';
import { AuthDivider } from './AuthDivider';
import { SocialLoginButtons } from './SocialLoginButtons';
import { PasswordStrength } from './PasswordStrength';
import { createClient } from '../../../src/lib/supabase/client';

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const passwordValue = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: passwordValue,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full space-y-4 text-center">
        <div className="bg-primary/10 text-primary rounded-md p-4 text-sm">
          Check your email to confirm your account.
        </div>
        <p className="text-muted-foreground text-sm">
          We sent a verification link to your email address.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" required className="h-11" placeholder="Jane" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" required className="h-11" placeholder="Doe" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="h-11"
            placeholder="jane@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            className="h-11"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && <PasswordStrength password={password} />}
        </div>

        <div className="flex items-start space-x-2 pt-2 pb-2">
          <Checkbox id="terms" required className="mt-1" />
          <label htmlFor="terms" className="text-muted-foreground text-sm leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary font-medium hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary font-medium hover:underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <Button type="submit" className="h-11 w-full text-base font-medium" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 size-5 animate-spin" /> : 'Create Account'}
          {!isLoading && <ArrowRight className="ml-2 size-4" />}
        </Button>
      </form>

      <AuthDivider />

      <SocialLoginButtons />

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-primary font-semibold hover:underline">
          Sign In
        </a>
      </p>
    </div>
  );
}
