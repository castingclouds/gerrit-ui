'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccountInfo } from '@/types/api';
import { gerritApi } from '@/lib/api';

interface AuthContextType {
  user: AccountInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, name: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('gerrit_auth_token');
    const username = localStorage.getItem('gerrit_username');
    
    if (token && username) {
      gerritApi.setAuthToken(token);
      // Try to get user info to validate token
      gerritApi.getAccount(username)
        .then(userInfo => {
          setUser(userInfo);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('gerrit_auth_token');
          localStorage.removeItem('gerrit_username');
          gerritApi.logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { token } = await gerritApi.authenticate(username, password);
      
      // Store auth token
      localStorage.setItem('gerrit_auth_token', token);
      localStorage.setItem('gerrit_username', username);
      
      // Get user info
      const userInfo = await gerritApi.getAccount(username);
      setUser(userInfo);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gerrit_auth_token');
    localStorage.removeItem('gerrit_username');
    gerritApi.logout();
    setUser(null);
  };

  const register = async (username: string, email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      // Use the new registration endpoint that handles password creation
      const userInfo = await gerritApi.registerAccount(username, email, name, password);
      
      // After successful registration, log in the user with the provided password
      await login(username, password);
      setUser(userInfo);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
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
