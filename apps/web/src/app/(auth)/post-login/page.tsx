import { redirect } from 'next/navigation';
import { getCurrentUser, getDashboardPath } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function PostLoginPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/auth/logout');
  }

  if (user.status === 'PENDING_APPROVAL') {
    redirect('/pending-approval');
  }

  if (user.status === 'REJECTED') {
    redirect('/access-denied?reason=rejected');
  }

  redirect(getDashboardPath(user.role));
}
