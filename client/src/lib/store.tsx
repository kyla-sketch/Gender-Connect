import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, InsertUser } from '@shared/schema';
import { authAPI } from './api';
import { queryClient } from './queryClient';

interface AuthContextType {
  currentUser: Omit<User, "password"> | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Omit<User, "password"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        // Not logged in
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authAPI.login(email, password);
    setCurrentUser(user);
  };

  const register = async (data: InsertUser) => {
    const user = await authAPI.register(data);
    setCurrentUser(user);
  };

  const logout = async () => {
    await authAPI.logout();
    setCurrentUser(null);
    // Clear all cached queries to prevent stale data
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
