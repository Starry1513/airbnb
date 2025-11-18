import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function UnauthenticatedNav() {
  return (
    <>
      <Button asChild>
        <Link to="/register">Register</Link>
      </Button>
      <Button asChild>
        <Link to="/login">Login</Link>
      </Button>
    </>
  );
}
