import { NotificationIcon } from './NotificationIcon';
import { formatTimeAgo } from '@/utils/timeUtils';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    message: string;
    timestamp: number;
    read: boolean;
  };
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500' : 'hover:bg-muted'}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(notification.timestamp)}</p>
        </div>
        {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
      </div>
    </div>
  );
}
