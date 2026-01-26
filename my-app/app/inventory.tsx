import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import VeriShelfAPI from '@/services/api';
import { parseISO, differenceInDays } from 'date-fns';

export default function InventoryScreen() {
  const { apiKey, apiBaseUrl, isAuthenticated } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !apiKey || !apiBaseUrl) {
      setLoading(false);
      return;
    }

    loadItems();
  }, [apiKey, apiBaseUrl, isAuthenticated]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchQuery))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const loadItems = async () => {
    try {
      const result = await api.getItems({ limit: 100, status: 'active' });
      const itemsList = result.data || [];
      setItems(itemsList);
      setFilteredItems(itemsList);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: 'No Date', color: '#64748b' };
    
    try {
      const expiry = parseISO(expiryDate);
      const days = differenceInDays(expiry, new Date());
      
      if (days < 0) return { label: 'Expired', color: '#ef4444' };
      if (days <= 3) return { label: 'Expiring Soon', color: '#f59e0b' };
      return { label: 'Safe', color: '#10b981' };
    } catch {
      return { label: 'Invalid', color: '#64748b' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = getExpiryStatus(item.expiry_date);
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => router.push(`/item/${item.id}`)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemDetail}>
            Location: {item.location || 'N/A'}
          </Text>
          {item.expiry_date && (
            <Text style={styles.itemDetail}>
              Expiry: {new Date(item.expiry_date).toLocaleDateString()}
            </Text>
          )}
          {item.quantity && (
            <Text style={styles.itemDetail}>Qty: {item.quantity}</Text>
          )}
          {item.price && (
            <Text style={styles.itemDetail}>Price: ${parseFloat(item.price).toFixed(2)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </View>
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
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f1f5f9',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    gap: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
});
