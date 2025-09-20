import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (sessionToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

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
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      
      if (sessionToken) {
        const userData = await ApiService.getCurrentUser();
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.google_user_data?.name || userData.email,
          picture: userData.google_user_data?.picture,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('sessionToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (sessionToken: string) => {
    try {
      await AsyncStorage.setItem('sessionToken', sessionToken);
      const userData = await ApiService.getCurrentUser();
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.google_user_data?.name || userData.email,
        picture: userData.google_user_data?.picture,
      });
    } catch (error) {
      console.error('Login failed:', error);
      await AsyncStorage.removeItem('sessionToken');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('sessionToken');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};