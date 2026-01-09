# Stripe Payment Setup Guide

## Current Status

The payment flow currently calculates the correct amount based on the number of locations selected, but **does not actually charge the customer**. The code only creates a payment method but doesn't process the payment.

## What You Need

To receive payments in your Stripe account, you need to set up one of these options:

### Option 1: Stripe Checkout (Recommended - Easiest)

Stripe Checkout is a hosted payment page that handles everything securely. You need a backend server to create the checkout session.

#### Backend Requirements

Create a backend API endpoint (Node.js/Express example):

```javascript
// POST /api/create-checkout-session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { amount, currency, planName, locationCount, customerEmail, successUrl, cancelUrl } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
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
      mode: 'subscription', // For recurring payments
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planName: planName,
        locationCount: locationCount,
        customerEmail: customerEmail,
      },
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Webhook Handler

You also need a webhook endpoint to handle successful payments:

```javascript
// POST /api/webhook
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Create user account in Supabase
    // Create subscription record
    // Send confirmation email
  }
  
  res.json({received: true});
});
```

### Option 2: Stripe Payment Intents (One-time payment)

For one-time payments, use Payment Intents:

```javascript
// Backend: POST /api/create-payment-intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: finalPrice * 100, // in cents
  currency: 'usd',
  metadata: {
    planName: selectedPlan.name,
    locationCount: locationCount,
  },
});
```

### Option 3: Stripe Subscriptions API (Recurring billing)

For automatic monthly billing:

```javascript
// Backend: POST /api/create-subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${planName} Plan`,
      },
      recurring: {
        interval: 'month',
      },
      unit_amount: finalPrice * 100, // in cents
    },
  }],
  metadata: {
    locationCount: locationCount,
  },
});
```

## Current Payment Calculation

The frontend correctly calculates:
- **Base price per location**: $199 (Professional) or $399 (Enterprise)
- **Discount tiers**:
  - 6-10 locations: 5% off
  - 11-25 locations: 10% off
  - 26-50 locations: 15% off
  - 51-100 locations: 20% off
  - 101-200 locations: 25% off
  - 201+ locations: 30% off
- **Final price**: `(basePrice * (1 - discount)) * locationCount`

## What Happens Now

Currently, when a user completes payment:
1. ✅ Price is calculated correctly based on locations
2. ✅ Payment method is created in Stripe
3. ✅ User account is created in Supabase
4. ✅ Subscription record is saved in database
5. ❌ **NO ACTUAL PAYMENT IS PROCESSED**

## Next Steps

1. **Set up a backend server** (Node.js, Python, etc.)
2. **Create the checkout session endpoint** using your Stripe Secret Key
3. **Set up webhook endpoint** to handle successful payments
4. **Update `website/main.js`** to call your backend API
5. **Test with Stripe test cards**: https://stripe.com/docs/testing

## Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

## Environment Variables Needed

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret
```

## Important Security Notes

⚠️ **NEVER expose your Stripe Secret Key in frontend code!**
- Secret keys must only be used on your backend server
- The publishable key (pk_test_...) is safe to use in frontend
- Always validate webhook signatures
- Use HTTPS in production

