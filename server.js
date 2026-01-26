// VeriShelf Stripe Payment Backend Server
// This server handles Stripe Checkout Session creation and webhooks

import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Validate Stripe secret key is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY is not set in .env file!');
  console.error('Please create a .env file with: STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

console.log('✅ Stripe Secret Key loaded:', process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow requests from verishelf.com
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow verishelf.com domains (both www and non-www)
    if (origin.includes('verishelf.com')) {
      return callback(null, true);
    }
    
    // Allow all origins for now (can restrict later)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Stripe-Signature'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Handle preflight OPTIONS requests FIRST, before CORS middleware
// This is critical - OPTIONS must be handled before other middleware
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Allow verishelf.com domains (www and non-www) and localhost
  if (origin && (origin.includes('verishelf.com') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Stripe-Signature');
    res.header('Access-Control-Max-Age', '86400');
  } else if (!origin) {
    // No origin header (mobile app, curl, etc.)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Stripe-Signature');
  }
  
  return res.status(204).send();
});

// Apply CORS to all routes
app.use(cors(corsOptions));

// Additional CORS headers for API routes (for non-OPTIONS requests)
app.use('/api', (req, res, next) => {
  // Skip if already handled by OPTIONS
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const origin = req.headers.origin;
  
  // Set CORS headers explicitly for all API routes
  if (origin && (origin.includes('verishelf.com') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  next();
});

app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For webhook signature verification

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://bblwhwobkthawkbyhiwb.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS'
);

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'usd', 
      planName, 
      locationCount, 
      customerEmail,
      successUrl,
      cancelUrl,
      metadata = {}
    } = req.body;

    if (!amount || !customerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and customerEmail are required' 
      });
    }

    // Create or retrieve Product in Stripe
    const productName = `${planName} Plan`;
    const productDescription = `VeriShelf ${planName} subscription plan`;
    
    // Search for existing product
    let product;
    const existingProducts = await stripe.products.search({
      query: `name:'${productName}' AND active:'true'`,
    });

    if (existingProducts.data.length > 0) {
      // Use existing product
      product = existingProducts.data[0];
      console.log('Using existing product:', product.id);
    } else {
      // Create new product
      product = await stripe.products.create({
        name: productName,
        description: productDescription,
        metadata: {
          planType: planName.toLowerCase(),
          service: 'VeriShelf'
        }
      });
      console.log('Created new product:', product.id);
    }

    // Create or retrieve Price for this specific location count
    const priceKey = `${product.id}_${locationCount}_${amount}`;
    let price;
    
    // Search for existing price with matching amount and recurring interval
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: 'recurring',
    });

    // Find price with matching amount and location count in metadata
    const matchingPrice = existingPrices.data.find(p => 
      p.unit_amount === amount && 
      p.recurring?.interval === 'month' &&
      p.metadata?.locationCount === locationCount.toString()
    );

    if (matchingPrice) {
      price = matchingPrice;
      console.log('Using existing price:', price.id);
    } else {
      // Create new price
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount, // Amount in cents
        currency: currency,
        recurring: {
          interval: 'month',
        },
        metadata: {
          locationCount: locationCount.toString(),
          planName: planName,
          planType: planName.toLowerCase(),
        },
        nickname: `${planName} - ${locationCount} location(s) - $${(amount / 100).toFixed(2)}/month`,
      });
      console.log('Created new price:', price.id, 'for', locationCount, 'locations');
    }

    // Create Stripe Checkout Session using the Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: price.id, // Use the Price ID instead of inline price_data
        quantity: 1,
      }],
      mode: 'subscription', // For recurring monthly payments
      customer_email: customerEmail,
      success_url: successUrl || `${req.headers.origin || 'http://localhost:5173'}/dashboard/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:5173'}/?canceled=true`,
      metadata: {
        planName: planName,
        locationCount: locationCount.toString(),
        customerEmail: customerEmail,
        productId: product.id,
        priceId: price.id,
        ...metadata
      },
    });

    console.log('Checkout session created:', session.id, 'with product:', product.id, 'and price:', price.id);

    // Set CORS headers for response
    const origin = req.headers.origin;
    if (origin && (origin.includes('verishelf.com') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.json({ 
      sessionId: session.id,
      productId: product.id,
      priceId: price.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Set CORS headers even for errors
    const origin = req.headers.origin;
    if (origin && (origin.includes('verishelf.com') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET not set. Webhook signature verification disabled.');
    // In development, you might want to skip verification
    // In production, ALWAYS verify webhook signatures
  }

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // For development only - parse without verification
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionDeleted(deletedSubscription);
      break;
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      await handlePaymentSucceeded(invoice);
      break;
    
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      await handlePaymentFailed(failedInvoice);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful checkout
async function handleCheckoutCompleted(session) {
  try {
    console.log('Checkout completed:', session.id);
    
    const { planName, locationCount, customerEmail } = session.metadata;
    
    // Find or create user in Supabase
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .limit(1);

    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }

    let userId;
    if (users && users.length > 0) {
      userId = users[0].id;
    } else {
      // User should already be created by frontend, but handle case if not
      console.warn('User not found for email:', customerEmail);
      return;
    }

    // Get customer from Stripe to get subscription ID
    const customerId = session.customer;
    let subscriptionId = null;
    
    if (customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
      });
      if (subscriptions.data.length > 0) {
        subscriptionId = subscriptions.data[0].id;
      }
    }

    // Calculate price details
    const locationCountNum = parseInt(locationCount) || 1;
    const basePrice = planName === 'Enterprise' ? 399 : 199;
    const discount = calculateDiscount(locationCountNum);
    const pricePerLocation = basePrice * (1 - discount);
    const finalPrice = pricePerLocation * locationCountNum;

    // Update or create subscription in database
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: planName,
        plan_key: planName.toLowerCase(),
        price: Math.round(finalPrice),
        price_per_location: Math.round(pricePerLocation),
        location_count: locationCountNum,
        base_price: basePrice,
        discount: discount,
        status: 'active',
        start_date: new Date().toISOString(),
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        payment_method_id: session.payment_intent,
        stripe_payment_method_id: session.payment_intent,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (subError) {
      console.error('Error updating subscription:', subError);
    } else {
      console.log('Subscription created/updated for user:', userId);
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    // Find user by Stripe customer ID (you may need to store this)
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .limit(1);

    if (error || !subscriptions || subscriptions.length === 0) {
      console.error('Subscription not found for customer:', customerId);
      return;
    }

    const userId = subscriptions[0].user_id;

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    console.log('Subscription status updated:', subscriptionId, status);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    const subscriptionId = subscription.id;

    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    console.log('Subscription cancelled:', subscriptionId);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
      
      console.log('Payment succeeded for subscription:', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId);
      
      console.log('Payment failed for subscription:', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Calculate discount based on location count
function calculateDiscount(locationCount) {
  if (locationCount >= 201) return 0.30;
  if (locationCount >= 101) return 0.25;
  if (locationCount >= 51) return 0.20;
  if (locationCount >= 26) return 0.15;
  if (locationCount >= 11) return 0.10;
  if (locationCount >= 6) return 0.05;
  return 0;
}

// Root endpoint - serve website index.html
app.get('/', (req, res) => {
  const indexPath = join(__dirname, 'website', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      message: 'VeriShelf Payment API',
      status: 'running',
      endpoints: {
        health: '/api/health',
        createCheckout: '/api/create-checkout-session',
        webhook: '/api/webhook'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// REST API v1 - Enterprise API Access
// ============================================

// Alternative: Stripe session authentication middleware
async function authenticateStripeSession(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Try API key auth instead
  }

  const token = authHeader.substring(7);
  
  // Check if it's a Stripe session token (starts with cs_ or sess_)
  if (!token.startsWith('cs_') && !token.startsWith('sess_')) {
    return next(); // Not a Stripe session, try API key auth
  }

  try {
    let customerId = null;
    
    // If it's a customer ID (starts with cus_), use it directly
    if (token.startsWith('cus_')) {
      customerId = token;
    } else {
      // Otherwise, it's a session ID - retrieve the session
      const session = await stripe.checkout.sessions.retrieve(token);
      
      if (!session || session.status !== 'complete') {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid or incomplete Stripe session'
        });
      }

      // Get customer ID from session
      customerId = session.customer;
      if (!customerId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'No customer associated with this session'
        });
      }
    }

    // Find user by Stripe customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, plan, status, stripe_customer_id')
      .eq('stripe_customer_id', customerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No active subscription found for this Stripe customer'
      });
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, company')
      .eq('id', subscription.user_id)
      .single();

    if (userError || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Check Enterprise plan requirement (unless dev mode)
    const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.DEV_MODE === 'true';
    if (!isDevelopment && subscription.plan !== 'Enterprise') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'API access requires Enterprise plan'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    return next();
  } catch (error) {
    // Not a valid Stripe session, try API key auth
    return next();
  }
}

// API Key authentication middleware
async function authenticateAPIKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // Development mode: Allow dev-bypass key
  const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.DEV_MODE === 'true';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'API key or Stripe session required. Include in Authorization header as: Bearer YOUR_API_KEY or Bearer cs_STRIPE_SESSION'
    });
  }

  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Allow dev-bypass in development mode
  if (isDevelopment && apiKey === 'dev-bypass') {
    // Create a dummy user object for dev mode
    req.user = {
      id: 'dev-user-id',
      email: 'dev@verishelf.local',
      name: 'Development User',
      company: 'Dev Company'
    };
    req.userId = 'dev-user-id';
    return next();
  }

  try {
    // Check if API key exists in database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, company, api_key_enabled')
      .eq('api_key', apiKey)
      .single();

    if (error || !user || !user.api_key_enabled) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or disabled API key'
      });
    }

    // Check if user has Enterprise plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription || subscription.plan !== 'Enterprise') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'API access requires Enterprise plan'
      });
    }

    // Update last used timestamp
    await supabase
      .from('users')
      .update({ api_key_last_used_at: new Date().toISOString() })
      .eq('id', user.id);

    // Attach user to request
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('API authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
}

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map();
const RATE_LIMITS = {
  professional: { requests: 1000, window: 3600000 }, // 1000 per hour
  enterprise: { requests: 10000, window: 3600000 }, // 10000 per hour
};

function rateLimitMiddleware(req, res, next) {
  const userId = req.userId;
  const now = Date.now();

  // Get user's subscription plan
  supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
    .then(({ data: subscription }) => {
      const plan = subscription?.plan?.toLowerCase() || 'professional';
      const limit = RATE_LIMITS[plan] || RATE_LIMITS.professional;

      if (!rateLimitStore.has(userId)) {
        rateLimitStore.set(userId, { count: 0, resetTime: now + limit.window });
      }

      const userLimit = rateLimitStore.get(userId);

      // Reset if window expired
      if (now > userLimit.resetTime) {
        userLimit.count = 0;
        userLimit.resetTime = now + limit.window;
      }

      // Check limit
      if (userLimit.count >= limit.requests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Rate limit of ${limit.requests} requests per hour exceeded. Please try again later.`,
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        });
      }

      // Increment counter
      userLimit.count++;
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.requests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.requests - userLimit.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(userLimit.resetTime / 1000));
      
      next();
    })
    .catch(() => next()); // Continue on error
}

// API Routes
const apiRouter = express.Router();

// Apply authentication and rate limiting to all API routes
// Try Supabase session first (for developers), then Stripe, then API key
apiRouter.use(authenticateSupabaseSession);
apiRouter.use(authenticateStripeSession);
apiRouter.use(authenticateAPIKey);
apiRouter.use(rateLimitMiddleware);

// GET /api/v1/items - Get all items (with pagination, filtering, sorting)
apiRouter.get('/items', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 per page
    const offset = (page - 1) * limit;
    
    // Filtering
    const location = req.query.location;
    const category = req.query.category;
    const status = req.query.status; // active, removed, discounted, re-merchandised
    const search = req.query.search; // Search in name, barcode
    
    // Sorting
    const sortBy = req.query.sort_by || 'added_at';
    const sortOrder = req.query.sort_order === 'asc' ? 'asc' : 'desc';
    
    // Build query
    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId);
    
    // Apply filters
    if (location) query = query.eq('location', location);
    if (category) query = query.eq('category', category);
    if (status) {
      if (status === 'removed') {
        query = query.eq('removed', true);
      } else {
        query = query.eq('item_status', status).eq('removed', false);
      }
    } else {
      // Default: only active items unless status specified
      query = query.eq('removed', false);
    }
    
    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }
    
    // Apply sorting
    const validSortFields = ['name', 'expiry_date', 'added_at', 'quantity', 'cost', 'location'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'added_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: items, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    // Transform to API format
    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      location: item.location,
      aisle: item.aisle,
      shelf: item.shelf,
      expiry_date: item.expiry_date,
      quantity: item.quantity,
      category: item.category,
      price: item.cost,
      status: item.item_status || (item.removed ? 'removed' : 'active'),
      removed: item.removed,
      added_at: item.added_at,
      removed_at: item.removed_at,
    }));

    res.json({
      data: formattedItems,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: offset + limit < (count || 0),
        has_prev: page > 1
      },
      meta: {
        filters: {
          location: location || null,
          category: category || null,
          status: status || 'active',
          search: search || null,
        },
        sort: {
          by: sortBy,
          order: sortOrder,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/items/expiring - Get expiring items
apiRouter.get('/items/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', req.userId)
      .eq('removed', false)
      .lte('expiry_date', cutoffDate.toISOString().split('T')[0])
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      location: item.location,
      aisle: item.aisle,
      shelf: item.shelf,
      expiry_date: item.expiry_date,
      quantity: item.quantity,
      category: item.category,
      price: item.cost,
      days_until_expiry: Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)),
    }));

    res.json({
      data: formattedItems,
      count: formattedItems.length,
      days: days
    });
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/items/:id - Get single item
apiRouter.get('/items/:id', async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error || !item) {
      return res.status(404).json({ error: 'Not found', message: 'Item not found' });
    }

    res.json({
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      location: item.location,
      aisle: item.aisle,
      shelf: item.shelf,
      expiry_date: item.expiry_date,
      quantity: item.quantity,
      category: item.category,
      price: item.cost,
      status: item.item_status || (item.removed ? 'removed' : 'active'),
      removed: item.removed,
      added_at: item.added_at,
      removed_at: item.removed_at,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/items - Create item (with validation)
apiRouter.post('/items', async (req, res) => {
  try {
    const { name, barcode, location, aisle, shelf, expiry_date, quantity, category, price } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'name is required and cannot be empty',
        field: 'name'
      });
    }

    if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'quantity must be a positive number',
        field: 'quantity'
      });
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'price must be a positive number',
        field: 'price'
      });
    }

    if (expiry_date && isNaN(Date.parse(expiry_date))) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'expiry_date must be a valid date (YYYY-MM-DD)',
        field: 'expiry_date'
      });
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        user_id: req.userId,
        name: name.trim(),
        barcode: barcode ? barcode.trim() : null,
        location: location ? location.trim() : null,
        aisle: aisle ? aisle.trim() : null,
        shelf: shelf ? shelf.trim() : null,
        expiry_date: expiry_date || null,
        quantity: quantity || 1,
        category: category ? category.trim() : null,
        cost: price || null,
        item_status: 'active',
        removed: false,
        added_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Conflict', 
          message: 'Item with this barcode already exists',
          field: 'barcode'
        });
      }
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    res.status(201).json({
      data: {
        id: item.id,
        name: item.name,
        barcode: item.barcode,
        location: item.location,
        aisle: item.aisle,
        shelf: item.shelf,
        expiry_date: item.expiry_date,
        quantity: item.quantity,
        category: item.category,
        price: item.cost,
        status: item.item_status,
      }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/v1/items/:id - Update item
apiRouter.put('/items/:id', async (req, res) => {
  try {
    const { expiry_date, quantity, location, aisle, shelf, price, status } = req.body;

    // Check item exists and belongs to user
    const { data: existingItem } = await supabase
      .from('items')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (!existingItem) {
      return res.status(404).json({ error: 'Not found', message: 'Item not found' });
    }

    const updateData = {};
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (location !== undefined) updateData.location = location;
    if (aisle !== undefined) updateData.aisle = aisle;
    if (shelf !== undefined) updateData.shelf = shelf;
    if (price !== undefined) updateData.cost = price;
    if (status !== undefined) {
      updateData.item_status = status;
      updateData.removed = status === 'removed';
      if (status === 'removed') {
        updateData.removed_at = new Date().toISOString();
      }
    }

    const { data: item, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    res.json({
      data: {
        id: item.id,
        name: item.name,
        barcode: item.barcode,
        location: item.location,
        aisle: item.aisle,
        shelf: item.shelf,
        expiry_date: item.expiry_date,
        quantity: item.quantity,
        category: item.category,
        price: item.cost,
        status: item.item_status,
      }
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/v1/items/:id - Delete item
apiRouter.delete('/items/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/v1/locations - Get all locations
apiRouter.get('/locations', async (req, res) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', req.userId)
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    res.json({
      data: stores.map(store => ({
        id: store.id,
        name: store.name,
        created_at: store.created_at,
      })),
      count: stores.length
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// API Key Management Endpoints (require Supabase auth session)
// POST /api/generate-api-key - Generate API key for Enterprise users
app.post('/api/generate-api-key', async (req, res) => {
  try {
    // Get user from Supabase auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }

    const userId = user.id;

    // Development mode: Allow API key generation without Enterprise plan
    const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.DEV_MODE === 'true';
    
    if (!isDevelopment) {
      // Check if user has Enterprise plan (production only)
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!subscription || subscription.plan !== 'Enterprise') {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'API key generation requires Enterprise plan'
        });
      }
    }

    // Generate API key
    const apiKey = `vs_live_${crypto.randomBytes(16).toString('hex')}`;

    // Save to database
    const { data: userData, error } = await supabase
      .from('users')
      .update({
        api_key: apiKey,
        api_key_enabled: true,
        api_key_created_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }
    
    res.json({
      api_key: apiKey,
      created_at: new Date().toISOString(),
      message: 'API key generated successfully. Store this key securely - it will not be shown again.',
      warning: 'Keep your API key secret. If compromised, regenerate it immediately.',
      ...(isDevelopment && { dev_mode: true, note: 'Development mode: Enterprise plan not required' })
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/stripe-session - Get Stripe customer ID for API access (requires Supabase auth)
app.get('/api/stripe-session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }

    // Get user's subscription with Stripe customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, plan, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      console.error('Error fetching subscription:', subError);
      return res.status(500).json({ 
        error: 'Database error', 
        message: subError.message 
      });
    }

    if (!subscription) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'No active subscription found. Please complete a payment first.' 
      });
    }

    if (!subscription.stripe_customer_id) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'No Stripe customer ID found. Your subscription may not be linked to Stripe.' 
      });
    }

    // Try to get existing checkout sessions for this customer
    let sessionId = null;
    try {
      const sessions = await stripe.checkout.sessions.list({
        customer: subscription.stripe_customer_id,
        limit: 1,
      });
      
      if (sessions.data.length > 0 && sessions.data[0].status === 'complete') {
        sessionId = sessions.data[0].id;
      }
    } catch (stripeError) {
      console.warn('Could not retrieve Stripe sessions:', stripeError.message);
      // Continue without session ID
    }

    // Return customer ID and any available session ID
    res.json({
      customer_id: subscription.stripe_customer_id,
      session_id: sessionId,
      plan: subscription.plan,
      status: subscription.status,
      message: sessionId 
        ? `Use this for API authentication: Authorization: Bearer ${sessionId}`
        : `Use your Stripe customer ID: ${subscription.stripe_customer_id}`,
      note: sessionId 
        ? 'You can use the session ID above for API authentication'
        : 'No active session found. You may need to complete a payment to get a session ID.'
    });
  } catch (error) {
    console.error('Error getting Stripe session:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// GET /api/api-key-status - Get API key status (requires auth)
app.get('/api/api-key-status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }

    // Fetch API key status with error handling
    let userData = null;
    let hasError = false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('api_key, api_key_enabled, api_key_created_at, api_key_last_used_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        // Check if error is due to missing columns
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          console.warn('API key columns may not exist. Run the migration: supabase/api_keys_migration.sql');
          hasError = true;
        } else {
          console.error('Error fetching API key status:', error);
          return res.status(500).json({ error: 'Database error', message: error.message });
        }
      } else {
        userData = data;
      }
    } catch (err) {
      console.error('Exception fetching API key status:', err);
      hasError = true;
    }

    // Return safe default values if error or no data
    if (hasError || !userData) {
      return res.json({
        has_api_key: false,
        enabled: false,
        created_at: null,
        last_used_at: null,
      });
    }

    // Handle NULL values safely
    res.json({
      has_api_key: !!(userData.api_key && userData.api_key_enabled),
      enabled: userData.api_key_enabled === true,
      created_at: userData.api_key_created_at || null,
      last_used_at: userData.api_key_last_used_at || null,
      // Don't return the actual key for security
    });
  } catch (error) {
    console.error('Error getting API key status:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/regenerate-api-key - Regenerate API key (requires auth)
app.post('/api/regenerate-api-key', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }

    const userId = user.id;

    // Development mode: Allow API key regeneration without Enterprise plan
    const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.DEV_MODE === 'true';
    
    if (!isDevelopment) {
      // Check Enterprise plan (production only)
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!subscription || subscription.plan !== 'Enterprise') {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'API key regeneration requires Enterprise plan'
        });
      }
    }

    // Generate new API key
    const apiKey = `vs_live_${crypto.randomBytes(16).toString('hex')}`;

    // Update in database
    const { error } = await supabase
      .from('users')
      .update({
        api_key: apiKey,
        api_key_enabled: true,
        api_key_created_at: new Date().toISOString(),
        api_key_last_used_at: null, // Reset last used
      })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }
    
    res.json({
      api_key: apiKey,
      created_at: new Date().toISOString(),
      message: 'API key regenerated successfully. Your old key is now invalid.',
      warning: 'Update all integrations with the new key immediately.',
      ...(isDevelopment && { dev_mode: true, note: 'Development mode: Enterprise plan not required' })
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/disable-api-key - Disable API key (requires auth)
app.post('/api/disable-api-key', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }

    const { error } = await supabase
      .from('users')
      .update({
        api_key_enabled: false,
      })
      .eq('id', user.id);

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    res.json({
      message: 'API key disabled successfully. All API requests will now be rejected.'
    });
  } catch (error) {
    console.error('Error disabling API key:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/v1/items/bulk - Bulk create items
apiRouter.post('/items/bulk', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'items must be a non-empty array'
      });
    }

    if (items.length > 100) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'Maximum 100 items per bulk operation'
      });
    }

    // Validate each item
    const validatedItems = items.map((item, index) => {
      if (!item.name || item.name.trim().length === 0) {
        throw new Error(`Item at index ${index}: name is required`);
      }
      return {
        user_id: req.userId,
        name: item.name.trim(),
        barcode: item.barcode ? item.barcode.trim() : null,
        location: item.location ? item.location.trim() : null,
        aisle: item.aisle ? item.aisle.trim() : null,
        shelf: item.shelf ? item.shelf.trim() : null,
        expiry_date: item.expiry_date || null,
        quantity: item.quantity || 1,
        category: item.category ? item.category.trim() : null,
        cost: item.price || null,
        item_status: 'active',
        removed: false,
        added_at: new Date().toISOString(),
      };
    });

    const { data: createdItems, error } = await supabase
      .from('items')
      .insert(validatedItems)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    res.status(201).json({
      data: createdItems.map(item => ({
        id: item.id,
        name: item.name,
        barcode: item.barcode,
        location: item.location,
        aisle: item.aisle,
        shelf: item.shelf,
        expiry_date: item.expiry_date,
        quantity: item.quantity,
        category: item.category,
        price: item.cost,
        status: item.item_status,
      })),
      count: createdItems.length
    });
  } catch (error) {
    console.error('Error bulk creating items:', error);
    res.status(400).json({ error: 'Validation error', message: error.message });
  }
});

// GET /api/v1/stats - Get account statistics
apiRouter.get('/stats', async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', req.userId);

    if (error) {
      return res.status(500).json({ error: 'Database error', message: error.message });
    }

    const activeItems = items.filter(i => !i.removed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expired = activeItems.filter(i => {
      if (!i.expiry_date) return false;
      return new Date(i.expiry_date) < today;
    });

    const expiringSoon = activeItems.filter(i => {
      if (!i.expiry_date) return false;
      const expiry = new Date(i.expiry_date);
      const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 7;
    });

    const totalValue = activeItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
    const expiredValue = expired.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);

    res.json({
      total_items: activeItems.length,
      expired_count: expired.length,
      expiring_soon_count: expiringSoon.length,
      total_value: totalValue,
      expired_value: expiredValue,
      locations: [...new Set(activeItems.map(i => i.location).filter(Boolean))].length,
      categories: [...new Set(activeItems.map(i => i.category).filter(Boolean))].length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Mount API router
app.use('/api/v1', apiRouter);

// Serve static website files (after all API routes)
app.use(express.static(join(__dirname, 'website')));

// Serve built React app at /dashboard
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use('/dashboard', express.static(distPath));
  // Serve index.html for all /dashboard routes (SPA routing)
  app.get('/dashboard/*', (req, res) => {
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Dashboard not built. Run "npm run build" first.');
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriShelf Server running on port ${PORT}`);
  if (process.env.STRIPE_SECRET_KEY) {
    const keyPreview = process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...';
    console.log(`✅ Stripe Secret Key loaded: ${keyPreview}`);
  } else {
    console.error('❌ STRIPE_SECRET_KEY not set! Payments will not work.');
    console.error('Create a .env file with: STRIPE_SECRET_KEY=sk_test_...');
  }
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const webhookPreview = process.env.STRIPE_WEBHOOK_SECRET.substring(0, 12) + '...';
    console.log(`✅ Webhook Secret loaded: ${webhookPreview}`);
    console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhook`);
  } else {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set. Webhook signature verification disabled.');
    console.warn('   For production, add STRIPE_WEBHOOK_SECRET to .env');
  }
  
  console.log(`\n🌐 Website: http://localhost:${PORT}/`);
  if (existsSync(distPath)) {
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard/`);
  } else {
    console.log(`📊 Dashboard: Not built. Run "npm run build" to enable.`);
  }
  console.log(`📡 API: http://localhost:${PORT}/api/health\n`);
});

