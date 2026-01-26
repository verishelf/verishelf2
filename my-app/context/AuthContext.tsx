import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  apiKey: string | null;
  apiBaseUrl: string | null;
  loading: boolean;
  login: (key: string, baseUrl: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedApiKey = await AsyncStorage.getItem('verishelf_api_key');
      const storedBaseUrl = await AsyncStorage.getItem('verishelf_api_base_url');
      
      if (storedApiKey && storedBaseUrl) {
        setApiKey(storedApiKey);
        setApiBaseUrl(storedBaseUrl);
        setIsAuthenticated(true);
      } else {
        // Development mode: Auto-authenticate with default localhost settings
        // This bypasses API key requirement for local development
        // @ts-ignore - __DEV__ is a React Native global
        const devMode = typeof __DEV__ !== 'undefined' ? __DEV__ : (process.env.NODE_ENV !== 'production');
        if (devMode) {
          const defaultBaseUrl = 'http://localhost:3000';
          const defaultApiKey = 'dev-bypass'; // Dummy key for dev mode
          setApiKey(defaultApiKey);
          setApiBaseUrl(defaultBaseUrl);
          setIsAuthenticated(true);
          // Optionally save for persistence
          await AsyncStorage.setItem('verishelf_api_key', defaultApiKey);
          await AsyncStorage.setItem('verishelf_api_base_url', defaultBaseUrl);
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (key: string, baseUrl: string) => {
    try {
      await AsyncStorage.setItem('verishelf_api_key', key);
      await AsyncStorage.setItem('verishelf_api_base_url', baseUrl);
      setApiKey(key);
      setApiBaseUrl(baseUrl);
      setIsAuthenticated(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('verishelf_api_key');
      await AsyncStorage.removeItem('verishelf_api_base_url');
      setApiKey(null);
      setApiBaseUrl(null);
      setIsAuthenticated(false);
      router.replace('/login');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        apiKey,
        apiBaseUrl,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
