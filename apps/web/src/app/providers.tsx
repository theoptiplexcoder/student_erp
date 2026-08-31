'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStudentAuth, configureAdminAuth, configureFacultyAuth } from '@student-erp/sdk';
import { createClient } from '@/lib/supabase/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    const getToken = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    };
    configureStudentAuth(getToken);
    configureAdminAuth(getToken);
    configureFacultyAuth(getToken);
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
