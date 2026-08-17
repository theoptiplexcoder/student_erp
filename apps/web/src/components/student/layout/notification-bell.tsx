'use client';

import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import {
  useStudentNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@student-erp/hooks';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
} from '@student-erp/ui';
import { cn } from '@student-erp/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading, error } = useStudentNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Determine unread count
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);

  const [showNoNotifications, setShowNoNotifications] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const onBellClick = (e: React.MouseEvent) => {
    if (unreadCount === 0) {
      e.preventDefault();
      setShowNoNotifications(true);
      setTimeout(() => setShowNoNotifications(false), 2500);
    }
  };

  return (
    <div className="relative">
      {unreadCount > 0 ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[85vh] flex-col p-0 sm:max-w-[425px]">
            <DialogHeader className="border-b px-4 py-4">
              <div className="flex items-center justify-between">
                <DialogTitle>Notifications</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAllAsRead.isPending}
                  className="h-8 text-xs"
                >
                  <Check className="mr-2 h-3 w-3" />
                  Mark all read
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse flex-col gap-2 rounded-lg border p-3"
                    >
                      <div className="bg-muted h-4 w-3/4 rounded"></div>
                      <div className="bg-muted h-3 w-1/2 rounded"></div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="text-destructive py-4 text-center text-sm">
                  Failed to load notifications.
                </div>
              )}

              {!isLoading && !error && unreadNotifications.length > 0 && (
                <div className="flex flex-col gap-2">
                  {unreadNotifications.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors',
                        !notification.isRead
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-background hover:bg-muted',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            !notification.isRead && 'text-primary',
                          )}
                        >
                          {notification.title}
                        </span>
                        {notification.createdAt && (
                          <span className="text-muted-foreground mt-0.5 text-[10px] whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Button variant="ghost" size="icon" className="relative" onClick={onBellClick}>
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      )}

      {showNoNotifications && unreadCount === 0 && (
        <div className="bg-popover text-popover-foreground animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 w-48 rounded-md border px-3 py-2 text-sm shadow-md">
          No new notifications yet
        </div>
      )}
    </div>
  );
}
