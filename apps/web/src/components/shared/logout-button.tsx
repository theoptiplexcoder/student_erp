'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@student-erp/ui';
import { LogOut, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'icon',
  className = '',
  showText = false,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear react-query cache
      queryClient.clear();

      // Navigate to login
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
      aria-label="Log out"
    >
      {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
      {showText && <span className="ml-2">{isLoggingOut ? 'Logging out...' : 'Log out'}</span>}
    </Button>
  );
}
