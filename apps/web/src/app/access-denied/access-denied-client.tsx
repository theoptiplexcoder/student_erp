'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldX, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@student-erp/ui';
import { createClient } from '@/lib/supabase/client';

export function AccessDeniedClient() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      window.location.href = '/login';
    }
  };

  const isRejected = reason === 'rejected';

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="bg-card text-card-foreground border-border w-full max-w-md rounded-2xl border p-6 text-center shadow-xl sm:p-8">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <ShieldX className="h-8 w-8" />
        </div>

        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {isRejected ? 'Registration Rejected' : 'Access Denied'}
        </h1>

        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
          {isRejected
            ? 'Your tenant registration request was reviewed and declined by the platform administrator. Please contact support or reach out to your administrator for more information.'
            : 'You do not have permission to access this resource or your role is not authorized for this view.'}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>

          <Link href="/login">
            <Button variant="default" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
