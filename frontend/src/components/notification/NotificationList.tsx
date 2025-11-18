import { NotificationItem } from './NotificationItem';
import { EmptyNotifications } from './EmptyNotifications';

interface NotificationListProps {
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: number;
    read: boolean;
    listingId: number;
    bookingId: number;
  }>;
  onNotificationClick: (notification: {
    id: string;
    listingId: number;
    bookingId: number;
    read: boolean;
  }) => void;
}

export function NotificationList({ notifications, onNotificationClick }: NotificationListProps) {
  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <div className="space-y-1">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onClick={() => onNotificationClick(notification)} />
      ))}
    </div>
  );
}
