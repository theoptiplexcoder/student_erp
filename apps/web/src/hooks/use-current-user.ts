'use client';

import { useQuery } from '@tanstack/react-query';
import { AuthUser } from '@/lib/auth';

export function useCurrentUser() {
  return useQuery<{ user: AuthUser }>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        throw new Error('Failed to fetch current user');
      }

      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if unauthorized
  });
}
