import { createContext } from 'react';

export interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  login: (newToken: string, email: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
