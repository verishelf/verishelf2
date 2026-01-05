// VeriShelf Backend Server - Stripe Subscription Handler
// Run with: node server.js
// Make sure to set STRIPE_SECRET_KEY environment variable

const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
// Try multiple paths to find .env file
const envPaths = [
  path.join(__dirname, '.env'),           // Same directory as server.js
  path.join(process.cwd(), '.env'),       // Current working directory
  path.join(process.cwd(), 'server', '.env'), // server subdirectory
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`✅ Loaded .env from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

// If no .env file found, try default dotenv behavior
if (!envLoaded) {
  require('dotenv').config();
  console.log(`⚠️  No .env file found in: ${envPaths.join(', ')}`);
  console.log(`📝 Using environment variables or default dotenv behavior`);
}

const express = require('express');
const cors = require('cors');

// Validate Stripe key BEFORE initializing Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY is not set!');
  console.error('📝 Please create a .env file in the server directory with:');
  console.error('   STRIPE_SECRET_KEY=sk_live_YOUR_KEY or sk_test_YOUR_KEY');
  console.error(`\n💡 Tried looking in:`);
  envPaths.forEach(p => console.error(`   - ${p}`));
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ ERROR: Invalid Stripe secret key format!');
  console.error('📝 Stripe secret keys should start with "sk_test_" or "sk_live_"');
  process.exit(1);
}

// Initialize Stripe AFTER validation
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.verishelf.com', 'https://verishelf.com']
    : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create or get customer
app.post('/api/customers', async (req, res) => {
  try {
    const { email, name, metadata } = req.body;
    
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update customer metadata if provided
      if (metadata) {
        customer = await stripe.customers.update(customer.id, { metadata });
      }
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: metadata || {}
      });
    }
    
    res.json({ customerId: customer.id, customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subscription with location-based pricing
app.post('/api/subscriptions/create', async (req, res) => {
  try {
    const { 
      customerId, 
      paymentMethodId, 
      planKey, 
      locationCount,
      metadata 
    } = req.body;

    if (!customerId || !paymentMethodId || !planKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate discount based on location count
    const getDiscount = (count) => {
      if (count >= 201) return 0.25;
      if (count >= 101) return 0.20;
      if (count >= 51) return 0.15;
      if (count >= 26) return 0.10;
      if (count >= 11) return 0.05;
      return 0;
    };

    const discount = getDiscount(locationCount || 1);
    
    // Stripe Price IDs - Update these after running setup-stripe-products.js
    // Or get them from Stripe Dashboard > Products
    const priceIds = {
      professional: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_PROFESSIONAL_PLACEHOLDER',
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_ENTERPRISE_PLACEHOLDER'
    };

    // Coupon IDs for volume discounts
    const couponIds = {
      5: 'volume-5pct',   // 11-25 locations
      10: 'volume-10pct', // 26-50 locations
      15: 'volume-15pct', // 51-100 locations
      20: 'volume-20pct', // 101-200 locations
      25: 'volume-25pct'  // 201+ locations
    };
    
    const priceId = priceIds[planKey];
    if (!priceId || priceId.includes('PLACEHOLDER')) {
      return res.status(500).json({ 
        error: 'Stripe Price IDs not configured. Please run setup-stripe-products.js first or set STRIPE_PRICE_PROFESSIONAL and STRIPE_PRICE_ENTERPRISE environment variables.' 
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Prepare subscription data
    const subscriptionData = {
      customer: customerId,
      items: [{
        price: priceId,
        quantity: locationCount || 1,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        planKey,
        locationCount: (locationCount || 1).toString(),
        discount: (discount * 100).toString(),
        ...metadata
      }
    };

    // Add coupon if discount applies
    if (discount > 0) {
      const discountPercent = Math.round(discount * 100);
      const couponId = couponIds[discountPercent];
      if (couponId) {
        subscriptionData.coupon = couponId;
      }
    }

    // Create subscription using Price ID (correct method)
    const subscription = await stripe.subscriptions.create(subscriptionData);

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm subscription payment
app.post('/api/subscriptions/confirm', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    res.json({ subscription });
  } catch (error) {
    console.error('Error confirming subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription details
app.get('/api/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    res.json({ subscription });
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
app.post('/api/subscriptions/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    
    res.json({ subscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object);
      // Update your database here
      break;
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object);
      // Update your database here
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription canceled:', event.data.object);
      // Update your database here
      break;
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded:', event.data.object);
      // Update your database here
      break;
    case 'invoice.payment_failed':
      console.log('Payment failed:', event.data.object);
      // Send notification to user
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Start server
const server = app.listen(PORT, () => {
  const host = process.env.NODE_ENV === 'production' 
    ? 'https://www.verishelf.com' 
    : `http://localhost:${PORT}`;
  
  console.log(`🚀 VeriShelf server running on ${host}`);
  console.log(`✅ Stripe secret key loaded: ${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...`);
  console.log(`🔗 Webhook URL: ${host}/api/webhooks/stripe`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /api/customers - Create/get customer`);
  console.log(`   POST /api/subscriptions/create - Create subscription`);
  console.log(`   POST /api/webhooks/stripe - Stripe webhooks`);
  console.log(`\n💡 Test the server: curl ${host}/api/health\n`);
});

// Export for Passenger (DreamHost)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
}

