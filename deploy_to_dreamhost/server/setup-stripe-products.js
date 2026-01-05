// Script to create Stripe Products and Prices
// Run this once to set up your Stripe products: node setup-stripe-products.js

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  console.log('🔧 Setting up Stripe Products and Prices...\n');

  try {
    // Check if products already exist
    const existingProducts = await stripe.products.list({ limit: 100 });
    const existingPrices = await stripe.prices.list({ limit: 100, active: true });

    // Create Professional Plan Product
    let professionalProduct = existingProducts.data.find(p => p.name === 'VeriShelf Professional');
    if (!professionalProduct) {
      professionalProduct = await stripe.products.create({
        name: 'VeriShelf Professional',
        description: 'Professional plan for VeriShelf - per location pricing',
        metadata: {
          planKey: 'professional',
          basePrice: '199'
        }
      });
      console.log('✅ Created Professional Product:', professionalProduct.id);
    } else {
      console.log('ℹ️  Professional Product already exists:', professionalProduct.id);
    }

    // Create Professional Plan Base Price ($199/month per location)
    let professionalPrice = existingPrices.data.find(p => 
      p.product === professionalProduct.id && 
      p.unit_amount === 19900 && 
      p.recurring?.interval === 'month'
    );
    
    if (!professionalPrice) {
      professionalPrice = await stripe.prices.create({
        product: professionalProduct.id,
        unit_amount: 19900, // $199.00 in cents
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          planKey: 'professional',
          basePrice: '199',
          perLocation: 'true'
        }
      });
      console.log('✅ Created Professional Price:', professionalPrice.id);
    } else {
      console.log('ℹ️  Professional Price already exists:', professionalPrice.id);
    }

    // Create Enterprise Plan Product
    let enterpriseProduct = existingProducts.data.find(p => p.name === 'VeriShelf Enterprise');
    if (!enterpriseProduct) {
      enterpriseProduct = await stripe.products.create({
        name: 'VeriShelf Enterprise',
        description: 'Enterprise plan for VeriShelf - per location pricing',
        metadata: {
          planKey: 'enterprise',
          basePrice: '399'
        }
      });
      console.log('✅ Created Enterprise Product:', enterpriseProduct.id);
    } else {
      console.log('ℹ️  Enterprise Product already exists:', enterpriseProduct.id);
    }

    // Create Enterprise Plan Base Price ($399/month per location)
    let enterprisePrice = existingPrices.data.find(p => 
      p.product === enterpriseProduct.id && 
      p.unit_amount === 39900 && 
      p.recurring?.interval === 'month'
    );
    
    if (!enterprisePrice) {
      enterprisePrice = await stripe.prices.create({
        product: enterpriseProduct.id,
        unit_amount: 39900, // $399.00 in cents
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          planKey: 'enterprise',
          basePrice: '399',
          perLocation: 'true'
        }
      });
      console.log('✅ Created Enterprise Price:', enterprisePrice.id);
    } else {
      console.log('ℹ️  Enterprise Price already exists:', enterprisePrice.id);
    }

    // Create Discount Coupons for volume pricing
    console.log('\n📋 Creating Volume Discount Coupons...\n');

    const coupons = [
      { id: 'volume-5pct', percent_off: 5, name: '5% Volume Discount (11-25 locations)' },
      { id: 'volume-10pct', percent_off: 10, name: '10% Volume Discount (26-50 locations)' },
      { id: 'volume-15pct', percent_off: 15, name: '15% Volume Discount (51-100 locations)' },
      { id: 'volume-20pct', percent_off: 20, name: '20% Volume Discount (101-200 locations)' },
      { id: 'volume-25pct', percent_off: 25, name: '25% Volume Discount (201+ locations)' }
    ];

    for (const coupon of coupons) {
      try {
        // Check if coupon exists
        try {
          await stripe.coupons.retrieve(coupon.id);
          console.log(`ℹ️  Coupon ${coupon.id} already exists`);
        } catch (e) {
          // Coupon doesn't exist, create it
          await stripe.coupons.create({
            id: coupon.id,
            percent_off: coupon.percent_off,
            duration: 'forever',
            name: coupon.name,
            metadata: {
              type: 'volume_discount'
            }
          });
          console.log(`✅ Created coupon: ${coupon.id} (${coupon.percent_off}% off)`);
        }
      } catch (error) {
        console.error(`❌ Error creating coupon ${coupon.id}:`, error.message);
      }
    }

    console.log('\n✅ Stripe Products and Prices Setup Complete!\n');
    console.log('📋 Summary:');
    console.log(`   Professional Product: ${professionalProduct.id}`);
    console.log(`   Professional Price: ${professionalPrice.id}`);
    console.log(`   Enterprise Product: ${enterpriseProduct.id}`);
    console.log(`   Enterprise Price: ${enterprisePrice.id}`);
    console.log('\n💡 Add these Price IDs to your server configuration:');
    console.log(`   Professional: ${professionalPrice.id}`);
    console.log(`   Enterprise: ${enterprisePrice.id}`);
    console.log('\n📝 Update server.js with these price IDs in the basePrices object.\n');

    return {
      professional: {
        productId: professionalProduct.id,
        priceId: professionalPrice.id
      },
      enterprise: {
        productId: enterpriseProduct.id,
        priceId: enterprisePrice.id
      }
    };

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupStripeProducts()
    .then(() => {
      console.log('🎉 Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupStripeProducts };

