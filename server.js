// VeriShelf Stripe Payment Backend Server
// This server handles Stripe Checkout Session creation and webhooks

import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: `${planName} Plan - ${locationCount} Location(s)`,
            description: `Monthly subscription for ${locationCount} location(s)`,
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: amount, // Amount in cents
        },
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
        ...metadata
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriShelf Payment Server running on port ${PORT}`);
  console.log(`📝 Make sure to set STRIPE_SECRET_KEY environment variable`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set! Payments will not work.');
  }
});

