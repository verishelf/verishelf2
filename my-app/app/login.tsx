import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import VeriShelfAPI from '@/services/api';

export default function LoginScreen() {
  const { login } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://verishelf-e0b90033152c.herokuapp.com');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key');
      return;
    }

    if (!baseUrl.trim()) {
      Alert.alert('Error', 'Please enter the API base URL');
      return;
    }

    setLoading(true);
    try {
      // Test the API key by making a simple request
      const api = new VeriShelfAPI(apiKey, baseUrl);
      await api.getStats();
      
      // If successful, save credentials
      await login(apiKey, baseUrl);
    } catch (error: any) {
      Alert.alert(
        'Authentication Failed',
        error.message || 'Invalid API key or base URL. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>VeriShelf</Text>
            <Text style={styles.tagline}>Retail Compliance Platform</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>API Base URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://api.verishelf.com"
              placeholderTextColor="#64748b"
              value={baseUrl}
              onChangeText={setBaseUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="vs_live_YOUR_API_KEY"
              placeholderTextColor="#64748b"
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.buttonText}>Connect</Text>
              )}
            </TouchableOpacity>

            {/* Development mode: Skip button */}
            {((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') && (
              <TouchableOpacity
                style={[styles.button, styles.skipButton]}
                onPress={async () => {
                  const defaultBaseUrl = baseUrl || 'https://verishelf-e0b90033152c.herokuapp.com';
                  const defaultApiKey = 'dev-bypass';
                  try {
                    await login(defaultApiKey, defaultBaseUrl);
                  } catch (error: any) {
                    Alert.alert('Error', 'Failed to skip login');
                  }
                }}
              >
                <Text style={styles.skipButtonText}>Skip (Dev Mode)</Text>
              </TouchableOpacity>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>Option 1:</Text> Use your dashboard session token (developers)
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>Option 2:</Text> Get API key from dashboard:
              </Text>
              <Text style={styles.infoText}>
                Settings → API Access → Generate API Key
              </Text>
              <Text style={styles.infoNote}>
                Note: In development mode, you can skip authentication.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#94a3b8',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#f1f5f9',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  infoNote: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  skipButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 12,
  },
  skipButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
