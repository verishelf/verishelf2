# Supabase Database Setup Instructions

This guide will help you set up the VeriShelf database in your Supabase project.

## Prerequisites

- Supabase account: https://bblwhwobkthawkbyhiwb.supabase.co
- Access to Supabase SQL Editor

## Setup Steps

### 1. Create Database Tables

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `SUPABASE_SCHEMA.sql`
4. Click **Run** to execute the SQL

This will create:
- `users` table - Stores user profiles
- `subscriptions` table - Stores subscription information
- `items` table - Stores user-specific inventory/items data
- Indexes for better performance
- Row Level Security (RLS) policies
- Automatic timestamp triggers

### 2. Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see:
   - `users` table
   - `subscriptions` table
   - `items` table

### 3. Test Authentication

The authentication is now integrated in the website:
- **Signup**: Users sign up during the payment flow
- **Login**: Users can log in with email/password
- **Database**: User accounts and subscriptions are automatically created

## Database Schema

### Users Table
- `id` (UUID, Primary Key) - References auth.users
- `email` (TEXT) - User email address
- `name` (TEXT) - User full name
- `company` (TEXT) - Company name
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### Subscriptions Table
- `id` (UUID, Primary Key)
- `user_id` (UUID) - References users.id
- `plan` (TEXT) - Plan name ('Professional' or 'Enterprise')
- `plan_key` (TEXT) - Plan key ('professional' or 'enterprise')
- `price` (DECIMAL) - Total monthly price
- `price_per_location` (DECIMAL) - Price per location after discount
- `location_count` (INTEGER) - Number of locations
- `base_price` (DECIMAL) - Base price before discount
- `discount` (DECIMAL) - Discount percentage (0.00 to 1.00)
- `status` (TEXT) - Subscription status ('active', 'cancelled', etc.)
- `start_date` (TIMESTAMPTZ) - Subscription start date
- `end_date` (TIMESTAMPTZ) - Subscription end date (nullable)
- `payment_method_id` (TEXT) - Stripe payment method ID
- `stripe_payment_method_id` (TEXT) - Stripe payment method ID
- `stripe_subscription_id` (TEXT) - Stripe subscription ID (nullable)
- `created_at` (TIMESTAMPTZ) - Record creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### Items Table
- `id` (BIGSERIAL, Primary Key)
- `user_id` (UUID) - References users.id
- `name` (TEXT) - Product/item name
- `barcode` (TEXT) - Barcode (nullable)
- `location` (TEXT) - Store/location name
- `expiry_date` (DATE) - Expiry date
- `quantity` (INTEGER) - Quantity
- `category` (TEXT) - Category (nullable)
- `cost` (DECIMAL) - Cost (nullable)
- `notes` (TEXT) - Notes (nullable)
- `removed` (BOOLEAN) - Whether item is removed
- `removed_at` (TIMESTAMPTZ) - Removal timestamp (nullable)
- `added_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

## Security

Row Level Security (RLS) is enabled:
- Users can only view/update their own profile
- Users can only view/update their own subscriptions
- Users can only view/update/delete their own items
- All operations require authentication
- Each user has completely isolated data

## Testing

1. **Test Signup Flow**:
   - Go to the website
   - Click "Get Started"
   - Select a plan
   - Fill in account details
   - Complete payment
   - User should be created in Supabase

2. **Test Login**:
   - Use the email/password from signup
   - Should authenticate successfully
   - Should redirect to dashboard

3. **Verify in Supabase**:
   - Check `users` table for new user
   - Check `subscriptions` table for new subscription
   - After adding items in dashboard, check `items` table (user-specific)

4. **Test Dashboard Isolation**:
   - Create two different user accounts
   - Add items in each account
   - Verify each user only sees their own items
   - Items should be stored with their `user_id` in the database

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the SQL schema file
- Check that tables are created in Table Editor

### Error: "permission denied"
- Check RLS policies are created
- Verify user is authenticated

### Error: "duplicate key value"
- User already exists with that email
- Try logging in instead of signing up

## Next Steps

- Set up email templates in Supabase Auth settings
- Configure email confirmation (optional)
- Set up password reset flow
- Add additional user fields as needed

