import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, MOCK_USERS, Gender } from './mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (gender: Gender) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (gender: Gender) => {
    // For demo purposes, we just pick the first user of that gender
    // In a real app, this would be a real login
    const user = MOCK_USERS.find(u => u.gender === gender);
    if (user) {
      setCurrentUser(user);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
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
