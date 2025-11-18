import { CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  unreadCount: number;
  hasNotifications: boolean;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export function NotificationHeader({ unreadCount, hasNotifications, onMarkAllRead, onClearAll }: NotificationHeaderProps) {
  return (
    <div className="p-2 border-b">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); onMarkAllRead(); }}>
              <CheckCheck className="h-3 w-3 mr-1" />Mark all read
            </Button>
          )}
          {hasNotifications && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); onClearAll(); }}>
              <Trash2 className="h-3 w-3 mr-1" />Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
