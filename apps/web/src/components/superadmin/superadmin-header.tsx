'use client';

import { useState } from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { Button } from '@student-erp/ui';
import { createClient } from '@/lib/supabase/client';

interface SuperadminHeaderProps {
  userEmail?: string;
  userName?: string;
}

export function SuperadminHeader({ userEmail, userName }: SuperadminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  return (
    <header className="border-border bg-card/50 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        <span className="bg-primary/10 text-primary border-primary/20 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">
          Superadmin Console
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-foreground text-sm leading-none font-semibold">
            {userName || 'Super Admin'}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-none">
            {userEmail || 'Platform Superadmin'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </Button>
      </div>
    </header>
  );
}
