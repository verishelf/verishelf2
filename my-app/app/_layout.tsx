import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="inventory" 
          options={{ 
            title: 'Inventory',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#10b981',
          }} 
        />
        <Stack.Screen 
          name="item/[id]" 
          options={{ 
            title: 'Item Details',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#10b981',
          }} 
        />
        <Stack.Screen 
          name="scanner" 
          options={{ 
            title: 'Scan Barcode',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#10b981',
          }} 
        />
        <Stack.Screen 
          name="add-item" 
          options={{ 
            title: 'Add Item',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#10b981',
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#10b981',
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
