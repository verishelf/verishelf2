import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (key, baseUrl) => {
    try {
      await AsyncStorage.setItem('verishelf_api_key', key);
      await AsyncStorage.setItem('verishelf_api_base_url', baseUrl);
      setApiKey(key);
      setApiBaseUrl(baseUrl);
      setIsAuthenticated(true);
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
