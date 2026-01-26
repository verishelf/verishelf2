// Script to upgrade a user account to Enterprise plan
// Usage: node upgrade-to-enterprise.js <email>

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://bblwhwobkthawkbyhiwb.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS'
);

const email = process.argv[2] || 'posadafamilyboston@gmail.com';

async function upgradeToEnterprise() {
  try {
    console.log(`🔍 Looking up user: ${email}...`);
    
    // First, try to find user in auth.users via admin API
    // Note: This requires service key, not anon key
    let authUser = null;
    try {
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      if (!authError && users) {
        authUser = users.find(u => u.email === email);
      }
    } catch (e) {
      console.log('⚠️  Could not check auth.users (may need service key)');
    }
    
    // Find user in users table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .limit(1);

    let user = users && users.length > 0 ? users[0] : null;

    // If user doesn't exist in users table but exists in auth, create profile
    if (!user && authUser) {
      console.log(`📝 User exists in auth but not in users table. Creating profile...`);
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email.split('@')[0],
          company: authUser.user_metadata?.company || null,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user profile:', createError);
        console.log('💡 You may need to use SUPABASE_SERVICE_KEY in .env for this operation');
        return;
      }
      user = newUser;
      console.log(`✅ Created user profile for ${user.email}`);
    }

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      console.log('💡 Options:');
      console.log('   1. Make sure the user has signed up and logged in at least once');
      console.log('   2. Check if SUPABASE_SERVICE_KEY is set in .env');
      console.log('   3. The user may need to sign up through the website first');
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   User ID: ${user.id}`);

    // Check existing subscription
    const { data: existingSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subError) {
      console.error('❌ Error checking subscriptions:', subError);
      return;
    }

    // Enterprise plan details
    const enterprisePlan = {
      user_id: user.id,
      plan: 'Enterprise',
      plan_key: 'enterprise',
      price: 399.00,
      price_per_location: 399.00,
      location_count: 1,
      base_price: 399.00,
      discount: 0.0,
      status: 'active',
      start_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingSubs && existingSubs.length > 0) {
      // Update existing subscription
      console.log(`📝 Updating existing subscription to Enterprise...`);
      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update(enterprisePlan)
        .eq('user_id', user.id)
        .select();

      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
        return;
      }

      console.log(`✅ Successfully upgraded to Enterprise plan!`);
      console.log(`   Plan: Enterprise`);
      console.log(`   Price: $${enterprisePlan.price}/month`);
      console.log(`   Status: ${enterprisePlan.status}`);
    } else {
      // Create new subscription
      console.log(`📝 Creating new Enterprise subscription...`);
      const { data: created, error: createError } = await supabase
        .from('subscriptions')
        .insert(enterprisePlan)
        .select();

      if (createError) {
        console.error('❌ Error creating subscription:', createError);
        return;
      }

      console.log(`✅ Successfully created Enterprise subscription!`);
      console.log(`   Plan: Enterprise`);
      console.log(`   Price: $${enterprisePlan.price}/month`);
      console.log(`   Status: ${enterprisePlan.status}`);
    }

    console.log(`\n🎉 Account upgraded successfully!`);
    console.log(`   User can now access API features.`);
    console.log(`   Please refresh the dashboard to see the changes.`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

upgradeToEnterprise();
