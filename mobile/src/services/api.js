/**
 * VeriShelf API Client for React Native
 */

class VeriShelfAPI {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiVersion = 'v1';
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}/api/${this.apiVersion}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
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
  async getItems(options = {}) {
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

  async getItem(itemId) {
    const result = await this.request('GET', `/items/${itemId}`);
    return result.data || result;
  }

  async createItem(itemData) {
    const result = await this.request('POST', '/items', itemData);
    return result.data || result;
  }

  async updateItem(itemId, itemData) {
    const result = await this.request('PUT', `/items/${itemId}`, itemData);
    return result.data || result;
  }

  async deleteItem(itemId) {
    await this.request('DELETE', `/items/${itemId}`);
    return true;
  }

  async getExpiringItems(days = 7) {
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
  async bulkCreateItems(items) {
    const result = await this.request('POST', '/items/bulk', { items });
    return result.data || [];
  }
}

export default VeriShelfAPI;
