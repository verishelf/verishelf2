-- SQL Script to Upgrade User to Enterprise Plan by User ID
-- Run this in Supabase SQL Editor
-- User ID: e44d7cd1-676e-413e-a23a-3ca4bbc5762e

DO $$
DECLARE
    user_id UUID := 'e44d7cd1-676e-413e-a23a-3ca4bbc5762e';
    existing_user_id UUID;
    subscription_id UUID;
    user_email TEXT;
BEGIN
    -- Step 1: Verify user exists in auth.users
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    IF user_email IS NULL THEN
        RAISE NOTICE 'User with ID % not found in auth.users', user_id;
        RETURN;
    END IF;

    RAISE NOTICE 'Found user: % (%)', user_email, user_id;

    -- Step 2: Check if user exists in users table, create if not
    SELECT id INTO existing_user_id
    FROM users
    WHERE id = user_id;

    IF existing_user_id IS NULL THEN
        -- Create user profile
        INSERT INTO users (id, email, name, company, created_at, updated_at)
        VALUES (
            user_id,
            user_email,
            COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_id), split_part(user_email, '@', 1)),
            COALESCE((SELECT raw_user_meta_data->>'company' FROM auth.users WHERE id = user_id), NULL),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created user profile for %', user_email;
    ELSE
        RAISE NOTICE 'User profile already exists for %', user_email;
    END IF;

    -- Step 3: Update or create Enterprise subscription
    -- Use explicit variable reference to avoid ambiguity
    INSERT INTO subscriptions (
        user_id,
        plan,
        plan_key,
        price,
        price_per_location,
        location_count,
        base_price,
        discount,
        status,
        start_date,
        created_at,
        updated_at
    )
    VALUES (
        upgrade_user_to_enterprise_by_id.user_id,  -- Explicit variable reference
        'Enterprise',
        'enterprise',
        399.00,
        399.00,
        1,
        399.00,
        0.0,
        'active',
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        plan = 'Enterprise',
        plan_key = 'enterprise',
        price = 399.00,
        price_per_location = 399.00,
        base_price = 399.00,
        discount = 0.0,
        status = 'active',
        updated_at = NOW();
    
    RAISE NOTICE 'Created/Updated Enterprise subscription for user %', user_email;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Successfully upgraded % to Enterprise plan!', user_email;
    RAISE NOTICE '   Plan: Enterprise';
    RAISE NOTICE '   Price: $399.00/month';
    RAISE NOTICE '   Status: active';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Account upgraded! User can now access API features.';

END $$;

-- Verify the upgrade
SELECT 
    u.id,
    u.email,
    u.name,
    s.plan,
    s.status,
    s.price,
    s.created_at as subscription_created,
    s.updated_at as subscription_updated
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.id = 'e44d7cd1-676e-413e-a23a-3ca4bbc5762e';
