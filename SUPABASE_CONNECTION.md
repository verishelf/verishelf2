# Supabase Connection Information

## Frontend Configuration (Already Set Up)

The frontend uses the Supabase JS client with these credentials:

- **Supabase URL**: `https://bblwhwobkthawkbyhiwb.supabase.co`
- **Anon Key**: `sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS`

These are configured in:
- `src/utils/supabase.js` (React dashboard)
- `website/main.js` (Landing page)

## Direct PostgreSQL Connection (For Backend/Migrations)

**Connection String** (Transaction Pooler):
```
postgresql://postgres.bblwhwobkthawkbyhiwb:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**⚠️ SECURITY WARNING:**
- Replace `[YOUR-PASSWORD]` with your actual database password
- **NEVER commit this connection string to git**
- Store it in environment variables for backend services
- Use this only for:
  - Database migrations
  - Backend services that need direct DB access
  - Database administration tools

## When to Use Each:

### Supabase JS Client (Frontend) ✅
- User authentication
- Reading/writing data from browser
- Real-time subscriptions
- Row Level Security (RLS) enforced

### Direct PostgreSQL Connection (Backend) 🔒
- Server-side operations
- Bulk data operations
- Database migrations
- Admin tasks

## Setup Steps:

1. **Run SQL Schema** (in Supabase Dashboard):
   - Go to SQL Editor
   - Run `SUPABASE_SCHEMA.sql`
   - This creates: `users`, `subscriptions`, and `items` tables

2. **Verify Tables Created**:
   - Check Table Editor in Supabase Dashboard
   - Should see: `users`, `subscriptions`, `items`

3. **Test Authentication**:
   - Sign up and pay → User and subscription created
   - Login → Should access dashboard

## Environment Variables (For Backend Services):

If you create a backend service, use environment variables:

```bash
SUPABASE_DB_URL=postgresql://postgres.bblwhwobkthawkbyhiwb:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://bblwhwobkthawkbyhiwb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS
```

