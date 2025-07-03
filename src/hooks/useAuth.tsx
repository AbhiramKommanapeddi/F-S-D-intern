'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Company, AuthResponse } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; company?: Company } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COMPANY'; payload: Company };

const initialState: AuthState = {
  user: null,
  company: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        company: action.payload.company || null,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_COMPANY':
      return {
        ...state,
        company: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'company' | 'bidder') => Promise<void>;
  logout: () => void;
  updateCompany: (company: Company) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      loadUserProfile();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const { user, company } = await apiClient.getProfile();
      dispatch({ type: 'LOGIN', payload: { user, company } });
    } catch {
      // Token might be invalid
      localStorage.removeItem('token');
      apiClient.clearToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const authData: AuthResponse = await apiClient.login({ email, password });
      dispatch({ type: 'LOGIN', payload: { user: authData.user, company: authData.company } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'company' | 'bidder') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const authData: AuthResponse = await apiClient.register({ name, email, password, role });
      apiClient.setToken(authData.token);
      dispatch({ type: 'LOGIN', payload: { user: authData.user, company: authData.company } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiClient.clearToken();
    dispatch({ type: 'LOGOUT' });
  };

  const updateCompany = (company: Company) => {
    dispatch({ type: 'SET_COMPANY', payload: company });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateCompany,
      }}
    >
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
