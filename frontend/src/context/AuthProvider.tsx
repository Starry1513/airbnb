import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('userEmail') || null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (userEmail) {  
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [userEmail]);

  const login = (newToken: string, email: string) => {
    setToken(newToken);
    setUserEmail(email);
  };

  const logout = () => {
    setToken(null);
    setUserEmail(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, userEmail, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
