import { Link } from 'react-router-dom';

export function NavbarLogo() {
  return (
    <div className="flex">
      <Link to="/" className="flex items-center">
        <span className="text-2xl font-bold text-primary">AirBrB</span>
      </Link>
    </div>
  );
}
