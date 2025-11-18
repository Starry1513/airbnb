import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationPanel } from '@/components/NotificationPanel';

interface AuthenticatedNavProps {
  onLogout: () => void;
}

export function AuthenticatedNav({ onLogout }: AuthenticatedNavProps) {
  return (
    <>
      <NotificationPanel />
      <Button asChild variant="outline">
        <Link to="/hosted-listings">My Listings</Link>
      </Button>
      <Button onClick={onLogout} variant="ghost">Logout</Button>
    </>
  );
}
