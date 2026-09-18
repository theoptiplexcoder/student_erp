import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PendingApprovalClient } from './pending-approval-client';

export const dynamic = 'force-dynamic';

export default async function PendingApprovalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If already active, direct them to their role's dashboard
  if (user.status === 'ACTIVE') {
    redirect('/post-login');
  }

  if (user.status === 'REJECTED') {
    redirect('/access-denied?reason=rejected');
  }

  return <PendingApprovalClient user={user} />;
}
