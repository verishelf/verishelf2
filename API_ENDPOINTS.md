# VeriShelf API Endpoints

## Base URL
**Production:** `https://verishelf-e0b90033152c.herokuapp.com`

All API endpoints are available at this base URL.

## Authentication

The API supports multiple authentication methods (tried in order):

1. **Supabase Session Token** (for developers/dashboard users)
   - Use your dashboard login session token
   - Format: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **Stripe Session/Customer ID** (for paid users)
   - Use Stripe checkout session ID or customer ID
   - Format: `Authorization: Bearer cs_test_...` or `Bearer cus_...`

3. **API Key** (traditional method)
   - Generate from dashboard → Settings → API Access
   - Format: `Authorization: Bearer vs_live_...`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### API v1 Endpoints

All v1 endpoints are under `/api/v1/`:

#### Items
- `GET /api/v1/items` - List items (with pagination, filtering, sorting)
- `GET /api/v1/items/:id` - Get item by ID
- `POST /api/v1/items` - Create item
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item
- `GET /api/v1/items/expiring?days=7` - Get expiring items
- `POST /api/v1/items/bulk` - Bulk create items

#### Locations
- `GET /api/v1/locations` - List all locations/stores

#### Stats
- `GET /api/v1/stats` - Get dashboard statistics

### API Key Management (Requires Supabase Auth)

- `GET /api/api-key-status` - Get API key status
- `POST /api/generate-api-key` - Generate new API key
- `POST /api/regenerate-api-key` - Regenerate API key
- `POST /api/disable-api-key` - Disable API key
- `GET /api/stripe-session` - Get Stripe session/customer ID

### Payment Endpoints

- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/webhook` - Stripe webhook endpoint

## Example Usage

### Using API Key
```bash
curl -X GET "https://verishelf-e0b90033152c.herokuapp.com/api/v1/items" \
  -H "Authorization: Bearer vs_live_YOUR_API_KEY"
```

### Using Supabase Session
```bash
curl -X GET "https://verishelf-e0b90033152c.herokuapp.com/api/v1/items" \
  -H "Authorization: Bearer YOUR_SUPABASE_SESSION_TOKEN"
```

### Using Stripe Session
```bash
curl -X GET "https://verishelf-e0b90033152c.herokuapp.com/api/v1/items" \
  -H "Authorization: Bearer cs_test_STRIPE_SESSION_ID"
```

## Mobile App Configuration

In the mobile app login screen:
- **API Base URL:** `https://verishelf-e0b90033152c.herokuapp.com`
- **API Key:** Your generated API key or session token

## Documentation

Full API documentation: `/api-docs.html`
