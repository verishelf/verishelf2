/**
 * VeriShelf JavaScript SDK
 * A simple client library for the VeriShelf API
 * 
 * Usage:
 *   const client = new VeriShelfClient('YOUR_API_KEY', 'https://YOUR_API_DOMAIN');
 *   const items = await client.getItems();
 */

class VeriShelfClient {
  constructor(apiKey, baseUrl = 'https://api.verishelf.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiVersion = 'v1';
  }

  /**
   * Make an API request
   */
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
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API request failed: ${response.status} ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  /**
   * Get all items (with pagination, filtering, sorting)
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50, max: 100)
   * @param {string} options.location - Filter by location
   * @param {string} options.category - Filter by category
   * @param {string} options.status - Filter by status (active, removed, discounted, re-merchandised)
   * @param {string} options.search - Search in name/barcode
   * @param {string} options.sort_by - Sort field (name, expiry_date, added_at, quantity, cost, location)
   * @param {string} options.sort_order - Sort order (asc, desc)
   */
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

  /**
   * Get a single item by ID
   */
  async getItem(itemId) {
    const result = await this.request('GET', `/items/${itemId}`);
    return result.data || result;
  }

  /**
   * Create a new item
   */
  async createItem(itemData) {
    const result = await this.request('POST', '/items', itemData);
    return result.data || result;
  }

  /**
   * Update an existing item
   */
  async updateItem(itemId, itemData) {
    const result = await this.request('PUT', `/items/${itemId}`, itemData);
    return result.data || result;
  }

  /**
   * Delete an item
   */
  async deleteItem(itemId) {
    await this.request('DELETE', `/items/${itemId}`);
    return true;
  }

  /**
   * Get items expiring within a specified number of days
   */
  async getExpiringItems(days = 7) {
    const result = await this.request('GET', `/items/expiring?days=${days}`);
    return result.data || [];
  }

  /**
   * Get all locations
   */
  async getLocations() {
    const result = await this.request('GET', '/locations');
    return result.data || [];
  }

  /**
   * Bulk create items (up to 100 items)
   * @param {Array} items - Array of item objects
   */
  async bulkCreateItems(items) {
    const result = await this.request('POST', '/items/bulk', { items });
    return result.data || [];
  }

  /**
   * Get account statistics
   */
  async getStats() {
    const result = await this.request('GET', '/stats');
    return result;
  }
}

// Export for use in Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VeriShelfClient;
}

// Export for use in browser (ES6 modules)
if (typeof window !== 'undefined') {
  window.VeriShelfClient = VeriShelfClient;
}
