import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, UserRegister, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          console.log('AuthContext - Raw userData from API:', userData);
          console.log('AuthContext - userData.is_admin:', userData.is_admin);
          console.log('AuthContext - typeof userData.is_admin:', typeof userData.is_admin);
          console.log('AuthContext - Full userData object:', JSON.stringify(userData, null, 2));
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const newToken = response.access_token;
      
      // Save token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Fetch user data
      const userData = await authAPI.getCurrentUser();
      console.log('AuthContext (login) - Raw userData from API:', userData);
      console.log('AuthContext (login) - userData.is_admin:', userData.is_admin);
      console.log('AuthContext (login) - Full userData object:', JSON.stringify(userData, null, 2));
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData: UserRegister) => {
    try {
      await authAPI.register(userData);
      // Do NOT auto-login — account needs admin approval first
      throw new Error('PENDING_APPROVAL');
    } catch (error: any) {
      if (error.message === 'PENDING_APPROVAL') throw error;
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Made with Bob
