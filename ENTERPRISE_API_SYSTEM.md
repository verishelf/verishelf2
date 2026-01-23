# VeriShelf Enterprise API System

## Overview

The VeriShelf Enterprise API is a production-ready REST API system that enables Enterprise customers to integrate VeriShelf with their existing POS, ERP, and custom systems.

## Features

### ✅ Authentication & Security
- **API Key Authentication**: Bearer token authentication
- **Enterprise Plan Required**: Only Enterprise subscribers can access the API
- **Rate Limiting**: 
  - Professional: 1,000 requests/hour
  - Enterprise: 10,000 requests/hour
- **Rate Limit Headers**: All responses include `X-RateLimit-*` headers
- **Secure Key Storage**: API keys stored encrypted in database
- **Key Management**: Generate, regenerate, and disable keys from dashboard

### ✅ Core Endpoints

#### Items Management
- `GET /api/v1/items` - List all items (with pagination, filtering, sorting)
- `GET /api/v1/items/:id` - Get single item
- `POST /api/v1/items` - Create item (with validation)
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item
- `POST /api/v1/items/bulk` - Bulk create (up to 100 items)
- `GET /api/v1/items/expiring?days=7` - Get expiring items

#### Locations
- `GET /api/v1/locations` - List all locations

#### Statistics
- `GET /api/v1/stats` - Get account statistics

### ✅ Advanced Features

#### Pagination
- `?page=1` - Page number
- `?limit=50` - Items per page (max: 100)
- Response includes pagination metadata

#### Filtering
- `?location=Store%20%23001` - Filter by location
- `?category=Food` - Filter by category
- `?status=active` - Filter by status (active, removed, discounted, re-merchandised)
- `?search=milk` - Search in name and barcode

#### Sorting
- `?sort_by=expiry_date` - Sort field (name, expiry_date, added_at, quantity, cost, location)
- `?sort_order=asc` - Sort order (asc, desc)

#### Validation
- Input validation on all create/update endpoints
- Clear error messages with field-level validation
- Date format validation
- Numeric range validation

### ✅ API Key Management

#### Dashboard Integration
- **Settings → API Access Tab**: Full UI for API key management
- Generate new API keys
- View key status (enabled/disabled, created date, last used)
- Regenerate keys (invalidates old key)
- Disable keys (temporarily disable without deleting)

#### Endpoints
- `POST /api/generate-api-key` - Generate new API key (requires Supabase auth)
- `GET /api/api-key-status` - Get API key status (requires Supabase auth)
- `POST /api/regenerate-api-key` - Regenerate API key (requires Supabase auth)
- `POST /api/disable-api-key` - Disable API key (requires Supabase auth)

### ✅ Error Handling
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)
- Consistent error response format:
  ```json
  {
    "error": "Error Type",
    "message": "Human-readable error message",
    "field": "field-name" // For validation errors
  }
  ```

### ✅ Response Format
All responses follow a consistent format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "filters": {...},
    "sort": {...}
  }
}
```

## Setup Instructions

### 1. Run Database Migration
Execute `supabase/api_keys_migration.sql` in Supabase SQL Editor to add API key support.

### 2. Generate API Key
- **Via Dashboard**: Settings → API Access → Generate API Key
- **Via API**: `POST /api/generate-api-key` (requires Supabase auth token)

### 3. Use the API
Include your API key in the Authorization header:
```
Authorization: Bearer vs_live_YOUR_API_KEY_HERE
```

## Example Usage

### JavaScript SDK
```javascript
const client = new VeriShelfClient('YOUR_API_KEY', 'https://YOUR_API_DOMAIN');

// Get items with filtering
const result = await client.getItems({
  page: 1,
  limit: 50,
  status: 'active',
  sort_by: 'expiry_date',
  sort_order: 'asc'
});

// Create item
const newItem = await client.createItem({
  name: "Product Name",
  location: "Store #001",
  expiry_date: "2025-12-31",
  quantity: 1
});

// Bulk create
const items = await client.bulkCreateItems([
  { name: "Item 1", location: "Store #001" },
  { name: "Item 2", location: "Store #001" }
]);
```

### cURL
```bash
# Get items
curl -X GET "https://YOUR_API_DOMAIN/api/v1/items?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Create item
curl -X POST "https://YOUR_API_DOMAIN/api/v1/items" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "location": "Store #001",
    "expiry_date": "2025-12-31"
  }'
```

## Rate Limits

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests per hour
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

When rate limit is exceeded, you'll receive:
- Status: `429 Too Many Requests`
- Response includes `retryAfter` (seconds until retry)

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables** to store keys
3. **Regenerate keys immediately** if compromised
4. **Monitor API usage** for suspicious activity
5. **Use HTTPS only** in production
6. **Rotate keys regularly** (quarterly recommended)

## Integration Examples

### POS System Integration
```javascript
// Sync products from POS to VeriShelf
async function syncProductsFromPOS() {
  const posProducts = await fetchFromPOS();
  const items = posProducts.map(product => ({
    name: product.name,
    barcode: product.sku,
    location: product.storeLocation,
    expiry_date: product.expiryDate,
    price: product.price
  }));
  
  await client.bulkCreateItems(items);
}
```

### ERP System Integration
```javascript
// Export VeriShelf data to ERP
async function exportToERP() {
  const items = await client.getItems({ status: 'active' });
  const erpFormat = items.data.map(item => ({
    product_id: item.id,
    product_name: item.name,
    expiry_date: item.expiry_date,
    location: item.location,
    status: item.status
  }));
  
  await sendToERP(erpFormat);
}
```

## Support

For API support, integration assistance, or to request additional endpoints:
- Email: general@verishelf.com
- Documentation: https://www.verishelf.com/api-docs.html
