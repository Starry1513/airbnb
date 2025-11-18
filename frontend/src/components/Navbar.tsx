import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useLogout } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/theme-toggle';
import { NavbarLogo } from './navbar/NavbarLogo';
import { AuthenticatedNav } from './navbar/AuthenticatedNav';
import { UnauthenticatedNav } from './navbar/UnauthenticatedNav';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuthContext();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout();
      navigate('/');
    } catch (_err) {
      logout();
      navigate('/');
    }
  };

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <NavbarLogo />
          <div className="flex items-center space-x-2">
            {isLoggedIn ? <AuthenticatedNav onLogout={handleLogout} /> : <UnauthenticatedNav />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
