import { redirect } from 'next/navigation';
import { getCurrentUser, getDashboardPath } from '../../../lib/auth';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PostLoginPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/auth/logout');
  }

  redirect(getDashboardPath(user.role));
}
