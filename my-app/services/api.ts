/**
 * VeriShelf API Client for React Native
 */

class VeriShelfAPI {
  apiKey: string;
  baseUrl: string;
  apiVersion: string;

  constructor(apiKey: string, baseUrl: string) {
    // Allow dev-bypass key for development mode
    // @ts-ignore - __DEV__ is a React Native global
    const isDevMode = apiKey === 'dev-bypass' || (typeof __DEV__ !== 'undefined' && __DEV__);
    
    if (!baseUrl) {
      throw new Error('API base URL is required');
    }
    
    // In dev mode, allow bypassing API key requirement
    if (!isDevMode && !apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = apiKey || 'dev-bypass';
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiVersion = 'v1';
  }

  async request(method: string, endpoint: string, data: any = null) {
    const url = `${this.baseUrl}/api/${this.apiVersion}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Only add Authorization header if not using dev-bypass
    if (this.apiKey !== 'dev-bypass') {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    
    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: response.statusText 
      }));
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  // Items
  async getItems(options: any = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.location) params.append('location', options.location);
    if (options.category) params.append('category', options.category);
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.sort_by) params.append('sort_by', options.sort_by);
    if (options.sort_order) params.append('sort_order', options.sort_order);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/items?${queryString}` : '/items';
    const result = await this.request('GET', endpoint);
    return result;
  }

  async getItem(itemId: string | number) {
    const result = await this.request('GET', `/items/${itemId}`);
    return result.data || result;
  }

  async createItem(itemData: any) {
    const result = await this.request('POST', '/items', itemData);
    return result.data || result;
  }

  async updateItem(itemId: string | number, itemData: any) {
    const result = await this.request('PUT', `/items/${itemId}`, itemData);
    return result.data || result;
  }

  async deleteItem(itemId: string | number) {
    await this.request('DELETE', `/items/${itemId}`);
    return true;
  }

  async getExpiringItems(days: number = 7) {
    const result = await this.request('GET', `/items/expiring?days=${days}`);
    return result.data || [];
  }

  // Locations
  async getLocations() {
    const result = await this.request('GET', '/locations');
    return result.data || [];
  }

  // Stats
  async getStats() {
    const result = await this.request('GET', '/stats');
    return result;
  }

  // Bulk operations
  async bulkCreateItems(items: any[]) {
    const result = await this.request('POST', '/items/bulk', { items });
    return result.data || [];
  }
}

export default VeriShelfAPI;
