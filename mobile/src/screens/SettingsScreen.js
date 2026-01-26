import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { apiKey, apiBaseUrl, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Base URL</Text>
            <Text style={styles.settingValue}>{apiBaseUrl}</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>API Key</Text>
            <Text style={styles.settingValue} numberOfLines={1}>
              {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            VeriShelf Mobile App v1.0.0
          </Text>
          <Text style={styles.aboutText}>
            Retail Compliance Platform
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  settingValue: {
    fontSize: 14,
    color: '#f1f5f9',
    flex: 1,
    textAlign: 'right',
  },
  aboutText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
