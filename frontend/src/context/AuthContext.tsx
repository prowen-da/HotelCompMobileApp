import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, guestLogin as apiGuestLogin } from '../services/api';

interface AuthState {
  isLoggedIn: boolean;
  isGuest: boolean;
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  guestLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isGuest: false,
    userId: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');
      const isGuest = await AsyncStorage.getItem('is_guest');
      if (token) {
        setState({
          isLoggedIn: true,
          isGuest: isGuest === 'true',
          userId,
          accessToken: token,
          refreshToken: await AsyncStorage.getItem('refresh_token'),
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (result.success && result.data) {
      const { user_id, access_token, refresh_token } = result.data;
      await AsyncStorage.multiSet([
        ['access_token', access_token],
        ['refresh_token', refresh_token || ''],
        ['user_id', String(user_id)],
        ['is_guest', 'false'],
      ]);
      setState({
        isLoggedIn: true,
        isGuest: false,
        userId: String(user_id),
        accessToken: access_token,
        refreshToken: refresh_token || null,
        isLoading: false,
      });
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const registerUser = async (name: string, email: string, password: string) => {
    const result = await apiRegister(name, email, password);
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const guestLoginFn = async () => {
    const result = await apiGuestLogin();
    if (result) {
      await AsyncStorage.multiSet([
        ['access_token', result.access_token],
        ['user_id', result.guest_id],
        ['is_guest', 'true'],
      ]);
      setState({
        isLoggedIn: true,
        isGuest: true,
        userId: result.guest_id,
        accessToken: result.access_token,
        refreshToken: null,
        isLoading: false,
      });
      return { success: true };
    }
    return { success: false, error: 'Guest login failed' };
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_id', 'is_guest']);
    setState({
      isLoggedIn: false,
      isGuest: false,
      userId: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, registerUser, guestLogin: guestLoginFn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
