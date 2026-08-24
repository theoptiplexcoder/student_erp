'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { LogoutButton } from '@/components/shared/logout-button';
import { Avatar, AvatarFallback } from '@student-erp/ui';

export function UserNav() {
  const { data } = useCurrentUser();
  const user = data?.user;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <LogoutButton />
    </div>
  );
}
