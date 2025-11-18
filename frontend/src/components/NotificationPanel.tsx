import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { NotificationHeader } from './notification/NotificationHeader';
import { NotificationList } from './notification/NotificationList';

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: { listingId: number; bookingId: number; read: boolean; id: string }) => {
    if (!notification.read) markAsRead(notification.id);
    navigate(`/booking-requests`);
  };

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
        <NotificationHeader unreadCount={unreadCount} hasNotifications={notifications.length > 0} onMarkAllRead={markAllAsRead} onClearAll={clearNotifications} />
        <div className="p-1">
          <NotificationList notifications={sortedNotifications} onNotificationClick={handleNotificationClick} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

