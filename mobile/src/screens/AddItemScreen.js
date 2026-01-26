import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import VeriShelfAPI from '../services/api';

export default function AddItemScreen({ route, navigation }) {
  const { apiKey, apiBaseUrl } = useAuth();
  const { barcode } = route.params || {};
  
  const [name, setName] = useState('');
  const [barcodeValue, setBarcodeValue] = useState(barcode || '');
  const [location, setLocation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [aisle, setAisle] = useState('');
  const [shelf, setShelf] = useState('');
  const [loading, setLoading] = useState(false);

  const api = new VeriShelfAPI(apiKey, apiBaseUrl);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Location is required');
      return;
    }

    if (!expiryDate.trim()) {
      Alert.alert('Error', 'Expiry date is required');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: name.trim(),
        barcode: barcodeValue.trim() || null,
        location: location.trim(),
        expiry_date: expiryDate.trim(),
        quantity: parseInt(quantity) || 1,
        cost: price ? parseFloat(price) : null,
        category: category.trim() || null,
        aisle: aisle.trim() || null,
        shelf: shelf.trim() || null,
        item_status: 'active',
      };

      await api.createItem(itemData);
      Alert.alert('Success', 'Item created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Barcode</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter barcode"
            placeholderTextColor="#64748b"
            value={barcodeValue}
            onChangeText={setBarcodeValue}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Store #001"
            placeholderTextColor="#64748b"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Expiry Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#64748b"
            value={expiryDate}
            onChangeText={setExpiryDate}
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#64748b"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#64748b"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Food, Beverages"
            placeholderTextColor="#64748b"
            value={category}
            onChangeText={setCategory}
          />

          <Text style={styles.label}>Aisle</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., A1"
            placeholderTextColor="#64748b"
            value={aisle}
            onChangeText={setAisle}
          />

          <Text style={styles.label}>Shelf</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Top"
            placeholderTextColor="#64748b"
            value={shelf}
            onChangeText={setShelf}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Create Item</Text>
            )}
          </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#f1f5f9',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
