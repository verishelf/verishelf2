import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#10b981',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'VeriShelf' }}
            />
            <Stack.Screen 
              name="Inventory" 
              component={InventoryScreen}
              options={{ title: 'Inventory' }}
            />
            <Stack.Screen 
              name="ItemDetail" 
              component={ItemDetailScreen}
              options={{ title: 'Item Details' }}
            />
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen}
              options={{ title: 'Scan Barcode' }}
            />
            <Stack.Screen 
              name="AddItem" 
              component={AddItemScreen}
              options={{ title: 'Add Item' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
