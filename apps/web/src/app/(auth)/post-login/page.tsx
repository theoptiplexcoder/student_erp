import { redirect } from 'next/navigation';
import { getCurrentUser, getDashboardPath } from '../../../lib/auth';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PostLoginPage() {
  const user = await getCurrentUser();

  if (!user) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  redirect(getDashboardPath(user.role));
}
