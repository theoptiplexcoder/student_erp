'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCw, LogOut, Building, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '@student-erp/ui';
import { AuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

interface PendingApprovalClientProps {
  user: AuthUser;
}

export function PendingApprovalClient({ user }: PendingApprovalClientProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      router.refresh();
      // Also route back through post-login to check status cleanly
      router.push('/post-login');
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to log out:', err);
      window.location.href = '/login';
    }
  };

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="bg-card text-card-foreground border-border w-full max-w-lg rounded-2xl border p-6 shadow-xl sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>

          <span className="mb-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
            Registration Submitted
          </span>

          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Pending Superadmin Approval
          </h1>

          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Thank you for registering your institution with our platform. Your administrator account
            and institution setup are currently in queue awaiting review by our platform operations
            team.
          </p>
        </div>

        <div className="bg-muted/40 border-border divide-border mt-6 divide-y rounded-xl border">
          <div className="flex items-center gap-3 p-3 sm:p-4">
            <Mail className="text-muted-foreground h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-medium">Administrator Email</p>
              <p className="text-foreground truncate text-sm font-semibold">{user.email}</p>
            </div>
          </div>

          {user.institution && (
            <div className="flex items-center gap-3 p-3 sm:p-4">
              <Building className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium">Institution</p>
                <p className="text-foreground truncate text-sm font-semibold">
                  {user.institution.displayName || user.institution.legalName}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 sm:p-4">
            <ShieldAlert className="text-muted-foreground h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs font-medium">Account Status</p>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {user.status}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full gap-2 sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
      </div>
    </div>
  );
}
