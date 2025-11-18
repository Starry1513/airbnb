import { Bell, Calendar, XCircle, CheckCircle2 } from 'lucide-react';

export function NotificationIcon({ type }: { type: string }) {
  switch (type) {
  case 'booking_request':
    return <Calendar className="h-4 w-4 text-blue-500" />;
  case 'booking_accepted':
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  case 'booking_declined':
    return <XCircle className="h-4 w-4 text-red-500" />;
  default:
    return <Bell className="h-4 w-4" />;
  }
}
