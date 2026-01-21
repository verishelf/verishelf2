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

// Get current auth user with role metadata
export async function getCurrentUserWithRole() {
  const supabase = getSupabase();
  if (!supabase) {
    const localUser = JSON.parse(localStorage.getItem('verishelf_user') || '{}');
    if (!localUser || !localUser.id) {
      return { user: null, role: null, linkedOwnerId: null };
    }
    // Treat local users as owners by default
    return {
      user: localUser,
      role: localUser.role || 'owner',
      linkedOwnerId: localUser.linkedOwnerId || null,
    };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { user: null, role: null, linkedOwnerId: null };
    }

    const role = user.user_metadata?.role || 'owner';
    const linkedOwnerId = user.user_metadata?.linked_owner_id || null;

    return { user, role, linkedOwnerId };
  } catch (e) {
    console.error('Error getting current user with role:', e);
    return { user: null, role: null, linkedOwnerId: null };
  }
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

// Fetch active inspector link for an inspector user
export async function getActiveInspectorLink(inspectorUserId) {
  const supabase = getSupabase();
  if (!supabase || !inspectorUserId) return null;

  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('inspector_links')
      .select('*')
      .eq('inspector_user_id', inspectorUserId)
      .eq('status', 'active')
      .or('scope_start.is.null,scope_start.lte.' + now)
      .or('scope_end.is.null,scope_end.gte.' + now)
      .or('expires_at.is.null,expires_at.gte.' + now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active inspector link:', error);
      return null;
    }

    return data || null;
  } catch (e) {
    console.error('Exception fetching active inspector link:', e);
    return null;
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
    expiry: item.expiry_date, // Keep both for compatibility
    quantity: item.quantity || 1,
    category: item.category,
    cost: item.cost,
    price: item.cost, // Keep both for compatibility
    notes: item.notes,
    removed: item.removed || false,
    removedAt: item.removed_at,
    addedAt: item.added_at,
  }));
}

// Internal helper to map DB item to app item format
function mapDbItemToAppItem(item) {
  return {
    id: item.id,
    name: item.name,
    barcode: item.barcode,
    location: item.location,
    expiryDate: item.expiry_date,
    expiry: item.expiry_date, // Keep both for compatibility
    quantity: item.quantity || 1,
    category: item.category,
    cost: item.cost,
    price: item.cost, // Keep both for compatibility
    notes: item.notes,
    removed: item.removed || false,
    removedAt: item.removed_at,
    addedAt: item.added_at,
  };
}

// Load items for an owner account with inspector scope applied
export async function loadItemsForOwnerWithScope(ownerUserId, scope = {}) {
  const supabase = getSupabase();
  if (!supabase || !ownerUserId) {
    return [];
  }

  try {
    let query = supabase
      .from('items')
      .select('*')
      .eq('user_id', ownerUserId)
      .order('added_at', { ascending: false });

    if (Array.isArray(scope.locations) && scope.locations.length > 0) {
      query = query.in('location', scope.locations);
    }

    if (scope.start) {
      query = query.gte('added_at', scope.start);
    }

    if (scope.end) {
      query = query.lte('added_at', scope.end);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error loading scoped items for owner:', error);
      return [];
    }

    return (data || []).map(mapDbItemToAppItem);
  } catch (e) {
    console.error('Exception loading scoped items for owner:', e);
    return [];
  }
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
    location: item.location || null,
    expiry_date: item.expiryDate || item.expiry_date || item.expiry || null,
    quantity: item.quantity || 1,
    category: item.category || null,
    cost: item.cost || item.price || null,
    notes: item.notes || null,
    removed: item.removed || false,
    removed_at: item.removedAt || item.removed_at || null,
    added_at: item.addedAt || item.added_at || new Date().toISOString(),
  };

  // Check if this is an update (item has an ID that exists in database) or insert (no ID or ID doesn't exist)
  if (item.id && typeof item.id === 'number' && item.id < 10000000000000) {
    // This looks like a database ID (not a timestamp), try to update
    const { data: existingData, error: checkError } = await supabase
      .from('items')
      .select('id')
      .eq('id', item.id)
      .eq('user_id', userId)
      .single();

    if (!checkError && existingData) {
      // Item exists, update it
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
    }
  }
  
  // Insert new item (either no ID, or ID doesn't exist in database)
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

// Load stores for a user from Supabase (with localStorage fallback)
export async function loadStoresForUser(userId) {
  const supabase = getSupabase();
  const localKey = 'verishelf-stores';

  // Fallback to localStorage only if Supabase is unavailable or userId missing
  if (!supabase || !userId) {
    const saved = localStorage.getItem(localKey);
    return saved ? JSON.parse(saved) : [];
  }

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading stores from Supabase:', error);
      const saved = localStorage.getItem(localKey);
      return saved ? JSON.parse(saved) : [];
    }

    const stores = (data || []).map((s) => ({
      id: s.id,
      name: s.name,
    }));

    // Keep localStorage in sync as a fallback for other parts of the app
    localStorage.setItem(localKey, JSON.stringify(stores));
    return stores;
  } catch (e) {
    console.error('Exception loading stores from Supabase:', e);
    const saved = localStorage.getItem(localKey);
    return saved ? JSON.parse(saved) : [];
  }
}

// Save stores for a user to Supabase (best-effort) and mirror to localStorage
export async function saveStoresForUser(userId, stores) {
  const supabase = getSupabase();
  const localKey = 'verishelf-stores';

  // Always keep localStorage updated so existing code continues to work
  try {
    localStorage.setItem(localKey, JSON.stringify(stores || []));
  } catch (e) {
    console.warn('Failed to save stores to localStorage:', e);
  }

  if (!supabase || !userId) {
    return { success: false, error: 'Supabase not initialized or missing userId' };
  }

  try {
    // Simple approach: delete all existing stores for this user, then insert current list
    const { error: deleteError } = await supabase
      .from('stores')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error clearing existing stores:', deleteError);
      return { success: false, error: deleteError };
    }

    if (!stores || stores.length === 0) {
      return { success: true, data: [] };
    }

    const rows = stores.map((s) => ({
      user_id: userId,
      name: typeof s === 'string' ? s : s.name,
    }));

    const { data, error: insertError } = await supabase
      .from('stores')
      .insert(rows)
      .select();

    if (insertError) {
      console.error('Error saving stores to Supabase:', insertError);
      return { success: false, error: insertError };
    }

    return { success: true, data };
  } catch (e) {
    console.error('Exception saving stores to Supabase:', e);
    return { success: false, error: e };
  }
}

// Log inspector event to Supabase (best-effort)
export async function logInspectorEvent({
  inspectorUserId,
  ownerUserId,
  eventType,
  itemId,
  location,
  metadata,
}) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('inspector_events').insert({
      inspector_user_id: inspectorUserId,
      owner_user_id: ownerUserId,
      event_type: eventType,
      item_id: itemId ?? null,
      location: location ?? null,
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.warn('Failed to log inspector event:', e);
  }
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

