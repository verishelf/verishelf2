import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import VeriShelfAPI from '@/services/api';
import { parseISO, differenceInDays } from 'date-fns';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { apiKey, apiBaseUrl, isAuthenticated } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !apiKey || !apiBaseUrl || !id) {
      setLoading(false);
      return;
    }

    loadItem();
  }, [id, apiKey, apiBaseUrl, isAuthenticated]);

  const loadItem = async () => {
    if (!apiKey || !apiBaseUrl || !id) return;
    
    try {
      const api = new VeriShelfAPI(apiKey, apiBaseUrl);
      const data = await api.getItem(id);
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!apiKey || !apiBaseUrl || !id) return;
            try {
              const api = new VeriShelfAPI(apiKey, apiBaseUrl);
              await api.deleteItem(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: 'No Date', color: '#64748b', days: null };
    
    try {
      const expiry = parseISO(expiryDate);
      const days = differenceInDays(expiry, new Date());
      
      if (days < 0) return { label: 'Expired', color: '#ef4444', days: Math.abs(days) };
      if (days <= 3) return { label: 'Expiring Soon', color: '#f59e0b', days };
      return { label: 'Safe', color: '#10b981', days };
    } catch {
      return { label: 'Invalid', color: '#64748b', days: null };
    }
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

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const status = getExpiryStatus(item.expiry_date);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          {item.barcode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Barcode:</Text>
              <Text style={styles.detailValue}>{item.barcode}</Text>
            </View>
          )}
          
          {item.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{item.location}</Text>
            </View>
          )}
          
          {item.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>
          )}
          
          {item.quantity && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>{item.quantity}</Text>
            </View>
          )}
          
          {item.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>${parseFloat(item.price).toFixed(2)}</Text>
            </View>
          )}
          
          {item.expiry_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expiry Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(item.expiry_date).toLocaleDateString()}
                {status.days !== null && (
                  <Text style={[styles.daysText, { color: status.color }]}>
                    {' '}({status.days < 0 ? `${status.days} days ago` : `${status.days} days left`})
                  </Text>
                )}
              </Text>
            </View>
          )}
          
          {item.aisle && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Aisle:</Text>
              <Text style={styles.detailValue}>{item.aisle}</Text>
            </View>
          )}
          
          {item.shelf && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shelf:</Text>
              <Text style={styles.detailValue}>{item.shelf}</Text>
            </View>
          )}
          
          {item.status && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>{item.status}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Item</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#94a3b8',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#f1f5f9',
    flex: 1,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
});
