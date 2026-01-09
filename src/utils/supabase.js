// Supabase Client for React Dashboard
const SUPABASE_URL = 'https://bblwhwobkthawkbyhiwb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS';

let supabaseClient = null;

// Initialize Supabase client
export function initSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  // Try to get from window (if loaded via CDN)
  if (typeof window !== 'undefined' && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return supabaseClient;
    } catch (e) {
      console.error('Error initializing Supabase from window:', e);
    }
  }

  // Try to import from npm package (if installed)
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  } catch (e) {
    // Supabase package not installed, will use CDN from window.supabase
    // This is expected if using CDN version
  }

  return null;
}

// Get Supabase client
export function getSupabase() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

// Check if user is authenticated
export async function checkAuth() {
  const supabase = getSupabase();
  if (!supabase) {
    // Fallback to localStorage check
    const user = JSON.parse(localStorage.getItem('verishelf_user') || '{}');
    return user.loggedIn ? { user, session: JSON.parse(localStorage.getItem('supabase_session') || 'null') } : null;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    // Fallback to localStorage
    const user = JSON.parse(localStorage.getItem('verishelf_user') || '{}');
    return user.loggedIn ? { user, session: JSON.parse(localStorage.getItem('supabase_session') || 'null') } : null;
  }

  return { session, user: session.user };
}

// Get current user profile
export async function getCurrentUserProfile() {
  const supabase = getSupabase();
  if (!supabase) {
    return JSON.parse(localStorage.getItem('verishelf_user') || '{}');
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      company: user.user_metadata?.company || '',
    };
  }

  return profile;
}

// Get user subscription
export async function getUserSubscription(userId) {
  const supabase = getSupabase();
  
  // First check localStorage as fallback
  const localSubscription = JSON.parse(localStorage.getItem('verishelf_subscription') || '{}');
  
  if (!supabase) {
    return localSubscription;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (error) {
      console.error('Error fetching subscription:', error);
      // Return localStorage subscription if database query fails
      return localSubscription;
    }

    // If no subscription in database but exists in localStorage, return localStorage
    if (!data && localSubscription && localSubscription.status === 'active') {
      return localSubscription;
    }

    return data || localSubscription;
  } catch (error) {
    console.error('Exception fetching subscription:', error);
    return localSubscription;
  }
}

// Load items from Supabase
export async function loadItems(userId) {
  const supabase = getSupabase();
  if (!supabase) {
    // Fallback to localStorage
    const saved = localStorage.getItem('verishelf-items');
    return saved ? JSON.parse(saved) : [];
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error loading items:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('verishelf-items');
    return saved ? JSON.parse(saved) : [];
  }

  // Convert database format to app format
  return data.map(item => ({
    id: item.id,
    name: item.name,
    barcode: item.barcode,
    location: item.location,
    expiryDate: item.expiry_date,
    quantity: item.quantity || 1,
    category: item.category,
    cost: item.cost,
    notes: item.notes,
    removed: item.removed || false,
    removedAt: item.removed_at,
    addedAt: item.added_at,
  }));
}

// Save item to Supabase
export async function saveItem(userId, item) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  const itemData = {
    user_id: userId,
    name: item.name,
    barcode: item.barcode || null,
    location: item.location,
    expiry_date: item.expiryDate || item.expiry_date,
    quantity: item.quantity || 1,
    category: item.category || null,
    cost: item.cost || null,
    notes: item.notes || null,
    removed: item.removed || false,
    removed_at: item.removedAt || item.removed_at || null,
  };

  if (item.id && typeof item.id === 'number') {
    // Update existing item
    const { data, error } = await supabase
      .from('items')
      .update(itemData)
      .eq('id', item.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return { success: false, error };
    }
    return { success: true, data };
  }
}

// Delete item from Supabase
export async function deleteItem(userId, itemId) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting item:', error);
    return { success: false, error };
  }

  return { success: true };
}

// Batch save items (for sync)
export async function batchSaveItems(userId, items) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  const itemsData = items.map(item => ({
    user_id: userId,
    name: item.name,
    barcode: item.barcode || null,
    location: item.location,
    expiry_date: item.expiryDate || item.expiry_date,
    quantity: item.quantity || 1,
    category: item.category || null,
    cost: item.cost || null,
    notes: item.notes || null,
    removed: item.removed || false,
    removed_at: item.removedAt || item.removed_at || null,
  }));

  const { data, error } = await supabase
    .from('items')
    .upsert(itemsData, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error batch saving items:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Logout user
export async function logout() {
  const supabase = getSupabase();
  
  // Clear Supabase session
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
  }
  
  // Clear localStorage
  localStorage.removeItem('verishelf_user');
  localStorage.removeItem('supabase_session');
  localStorage.removeItem('verishelf_subscription');
  
  // Redirect to website (index.html)
  // Use window.location.replace to prevent back button from going to dashboard
  window.location.replace('/');
}

