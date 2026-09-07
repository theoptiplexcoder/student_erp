'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building2,
  School,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Label, Checkbox } from '@student-erp/ui';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { PasswordStrength } from './PasswordStrength';
import { createClient } from '../../../src/lib/supabase/client';
import { apiClient } from '../../../src/lib/api-client';

type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY';

const INSTITUTION_TYPES: {
  type: InstitutionType;
  title: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    type: 'SCHOOL',
    title: 'K-12 School',
    desc: 'Primary, middle, or secondary high school',
    icon: School,
  },
  {
    type: 'COLLEGE',
    title: 'College / Institute',
    desc: 'Undergraduate or diploma college',
    icon: Building2,
  },
  {
    type: 'UNIVERSITY',
    title: 'University',
    desc: 'Multi-department or higher research institution',
    icon: GraduationCap,
  },
];

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Institution State (Step 1)
  const [institutionType, setInstitutionType] = useState<InstitutionType>('COLLEGE');
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState<string>();
  const [address, setAddress] = useState('');

  // Tenant Admin User State (Step 2)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState<string>();
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!legalName.trim()) {
      setError('Please provide the registered legal name of the institution.');
      return;
    }
    if (!displayName.trim()) {
      setError('Please provide the public campus/display name.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register Institution and Tenant Admin User via the backend API
      const registerPayload = {
        institutionType,
        legalName: legalName.trim(),
        displayName: displayName.trim(),
        phone: institutionPhone || undefined,
        address: address.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        adminPhone: adminPhone || institutionPhone || undefined,
      };

      await apiClient.post('/auth/register-institution', registerPayload);

      // 2. Sign in with Supabase Auth to establish the session in browser cookies
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        // If email confirmation is required by Supabase settings, show check-inbox screen
        setSuccess(true);
      } else {
        // Redirect to post-login which verifies user and redirects to /admin
        router.push('/post-login');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to complete institution registration. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Institution Registered!</h3>
          <p className="text-muted-foreground text-sm">
            We have created the administrative account for{' '}
            <strong className="text-foreground">{displayName}</strong>.
          </p>
          <p className="text-muted-foreground text-xs">
            Please check your email (<span className="text-foreground font-medium">{email}</span>)
            to confirm your account before logging in.
          </p>
        </div>
        <Button
          onClick={() => router.push('/login')}
          className="bg-primary hover:bg-primary/90 mt-4 w-full"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stepper Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === 1
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/20 text-primary font-semibold'
            }`}
          >
            1
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold">Step 1</p>
            <p className="text-muted-foreground text-xs">Institution Information</p>
          </div>
        </div>

        <div className="bg-border h-0.5 w-12" />

        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold">Step 2</p>
            <p className="text-muted-foreground text-xs">Tenant Admin Credentials</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      {/* STEP 1: INSTITUTION DETAILS */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          <div className="space-y-2">
            <Label>Institution Category *</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {INSTITUTION_TYPES.map((item) => {
                const isSelected = institutionType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setInstitutionType(item.type)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-primary ring-1'
                        : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <Icon
                      className={`mb-2 h-5 w-5 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <span className="text-xs font-bold">{item.title}</span>
                    <span className="text-muted-foreground mt-0.5 line-clamp-1 text-[10px]">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">
              Legal Registered Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="e.g. St. Xavier Educational Trust"
              required
              className="h-10"
            />
            <p className="text-muted-foreground text-[11px]">
              The registered organizational entity name for billing and compliance.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">
              Campus / Public Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. St. Xavier College of Engineering"
              required
              className="h-10"
            />
            <p className="text-muted-foreground text-[11px]">
              This name will be displayed to staff, faculty, students, and parents.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="institutionPhone">Official Contact Phone</Label>
              <PhoneInput
                id="institutionPhone"
                international={false}
                defaultCountry="IN"
                value={institutionPhone}
                onChange={setInstitutionPhone}
                className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Campus City / Location</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka"
                className="h-10"
              />
            </div>
          </div>

          <Button type="submit" className="bg-primary hover:bg-primary/90 mt-6 h-11 w-full gap-2">
            Continue to Admin Details <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Already registered your institution?{' '}
            <a href="/login" className="text-primary font-medium hover:underline">
              Sign In
            </a>
          </p>
        </form>
      )}

      {/* STEP 2: TENANT ADMIN DETAILS */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/40 mb-2 flex items-center justify-between rounded-lg border p-3 text-xs">
            <div>
              <p className="text-muted-foreground">Registering for:</p>
              <p className="text-foreground font-semibold">{displayName}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-primary hover:underline"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-10"
                placeholder="Jane"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-10"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Admin Official Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
              placeholder="admin@institution.edu"
            />
            <p className="text-muted-foreground text-[11px]">
              This will be your primary login and Super Administrator account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">Admin Mobile Phone</Label>
            <PhoneInput
              id="adminPhone"
              international={false}
              defaultCountry="IN"
              value={adminPhone}
              onChange={setAdminPhone}
              className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Account Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
              placeholder="••••••••"
            />
            <PasswordStrength password={password} />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-muted-foreground cursor-pointer text-xs">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              , and confirm I am authorized to register this institution.
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="h-11"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !termsAccepted}
              className="bg-primary hover:bg-primary/90 h-11 flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up Institution...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Create Institution & Admin
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
