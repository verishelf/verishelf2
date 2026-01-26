import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import VeriShelfAPI from '@/services/api';

export default function HomeScreen() {
  const { apiKey, apiBaseUrl, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !apiKey || !apiBaseUrl) {
      setLoading(false);
      return;
    }

    loadStats();
  }, [apiKey, apiBaseUrl, isAuthenticated]);

  const loadStats = async () => {
    if (!apiKey || !apiBaseUrl) return;
    
    try {
      const api = new VeriShelfAPI(apiKey, apiBaseUrl);
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!apiKey || !apiBaseUrl) return;
    setRefreshing(true);
    loadStats();
  };

  if (!isAuthenticated || !apiKey || !apiBaseUrl) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Please log in to continue</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalItems || 0}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                {stats.expired || 0}
              </Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                {stats.expiringSoon || 0}
              </Text>
              <Text style={styles.statLabel}>Expiring Soon</Text>
            </View>
            {stats.riskScore !== undefined && (
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#8b5cf6' }]}>
                  {stats.riskScore}
                </Text>
                <Text style={styles.statLabel}>Risk Score</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/inventory')}
            >
              <Text style={styles.actionButtonText}>View Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/scanner')}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Scan Barcode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/add-item')}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Add Item
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/settings')}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1e293b',
  },
  logoutText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#10b981',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
});
