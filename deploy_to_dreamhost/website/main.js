// VeriShelf Website - Authentication & Stripe Integration

// Configuration
// IMPORTANT: Replace these with your actual Stripe keys
// Get them from: https://dashboard.stripe.com/apikeys
const STRIPE_PUBLISHABLE_KEY = window.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';
const API_BASE_URL = window.VITE_API_URL || 'http://localhost:3000/api';

// Initialize Stripe
let stripe = null;
let elements = null;
let cardElement = null;

if (STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY !== 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
  try {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements();
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Stripe initialization failed:', error);
  }
} else {
  console.warn('⚠️ Stripe publishable key not configured. Please set your key in the HTML file.');
}

// Selected plan for subscription
let selectedPlan = null;

const plans = {
  professional: {
    name: 'Professional',
    basePrice: 199,
    price: 199,
    priceId: 'price_PROFESSIONAL', // Replace with your Stripe Price ID
    description: 'per location / month'
  },
  enterprise: {
    name: 'Enterprise',
    basePrice: 399,
    price: 399,
    priceId: 'price_ENTERPRISE', // Replace with your Stripe Price ID
    description: 'per location / month'
  }
};

// Discount tiers based on number of locations
function getDiscountTier(locationCount) {
  if (locationCount >= 201) return { discount: 0.25, tier: '201+' };
  if (locationCount >= 101) return { discount: 0.20, tier: '101-200' };
  if (locationCount >= 51) return { discount: 0.15, tier: '51-100' };
  if (locationCount >= 26) return { discount: 0.10, tier: '26-50' };
  if (locationCount >= 11) return { discount: 0.05, tier: '11-25' };
  return { discount: 0, tier: '1-10' };
}

// Update pricing based on location count
function updatePricing() {
  // Check both possible IDs for location input
  const locationInput = document.getElementById('locationCount') || document.getElementById('location-count');
  if (!locationInput) return;
  
  const locationCount = parseInt(locationInput.value) || 1;
  
  // Ensure minimum of 1 location
  if (locationCount < 1) {
    locationInput.value = 1;
    return updatePricing();
  }
  
  const discountTier = getDiscountTier(locationCount);
  const discountPercent = discountTier.discount * 100;
  
  // Update discount badge
  const discountBadge = document.getElementById('discountBadge');
  const discountText = document.getElementById('discountText');
  
  if (discountPercent > 0) {
    discountBadge.textContent = `${discountPercent}% OFF`;
    discountBadge.classList.remove('text-slate-400');
    discountBadge.classList.add('text-emerald-400');
    discountText.textContent = `${discountTier.tier} locations`;
  } else {
    discountBadge.textContent = '0% OFF';
    discountBadge.classList.remove('text-emerald-400');
    discountBadge.classList.add('text-slate-400');
    discountText.textContent = 'No discount for 1-10 locations';
  }
  
  // Update Professional plan pricing
  const professionalBasePrice = plans.professional.basePrice;
  const professionalDiscountedPrice = professionalBasePrice * (1 - discountTier.discount);
  const professionalTotal = professionalDiscountedPrice * locationCount;
  
  const professionalPriceEl = document.getElementById('professional-price');
  const professionalOriginalEl = document.getElementById('professional-original');
  const professionalTotalEl = document.getElementById('professional-total-amount');
  
  professionalPriceEl.textContent = `$${Math.round(professionalDiscountedPrice)}`;
  professionalTotalEl.textContent = `$${Math.round(professionalTotal).toLocaleString()}`;
  
  if (discountPercent > 0) {
    professionalOriginalEl.textContent = `$${professionalBasePrice}`;
    professionalOriginalEl.classList.remove('hidden');
  } else {
    professionalOriginalEl.classList.add('hidden');
  }
  
  // Update Enterprise plan pricing
  const enterpriseBasePrice = plans.enterprise.basePrice;
  const enterpriseDiscountedPrice = enterpriseBasePrice * (1 - discountTier.discount);
  const enterpriseTotal = enterpriseDiscountedPrice * locationCount;
  
  const enterprisePriceEl = document.getElementById('enterprise-price');
  const enterpriseOriginalEl = document.getElementById('enterprise-original');
  const enterpriseTotalEl = document.getElementById('enterprise-total-amount');
  
  enterprisePriceEl.textContent = `$${Math.round(enterpriseDiscountedPrice)}`;
  enterpriseTotalEl.textContent = `$${Math.round(enterpriseTotal).toLocaleString()}`;
  
  if (discountPercent > 0) {
    enterpriseOriginalEl.textContent = `$${enterpriseBasePrice}`;
    enterpriseOriginalEl.classList.remove('hidden');
  } else {
    enterpriseOriginalEl.classList.add('hidden');
  }
  
  // Update signup modal pricing
  const signupProfessionalPrice = document.getElementById('signup-professional-price');
  const signupProfessionalTotal = document.getElementById('signup-professional-total');
  const signupEnterprisePrice = document.getElementById('signup-enterprise-price');
  const signupEnterpriseTotal = document.getElementById('signup-enterprise-total');
  
  if (signupProfessionalPrice) {
    signupProfessionalPrice.textContent = `$${Math.round(professionalDiscountedPrice)}`;
  }
  if (signupProfessionalTotal) {
    signupProfessionalTotal.textContent = `Total: $${Math.round(professionalTotal).toLocaleString()}/mo`;
  }
  if (signupEnterprisePrice) {
    signupEnterprisePrice.textContent = `$${Math.round(enterpriseDiscountedPrice)}`;
  }
  if (signupEnterpriseTotal) {
    signupEnterpriseTotal.textContent = `Total: $${Math.round(enterpriseTotal).toLocaleString()}/mo`;
  }
  
  // Update plan prices for payment processing
  plans.professional.price = Math.round(professionalDiscountedPrice);
  plans.enterprise.price = Math.round(enterpriseDiscountedPrice);
}

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clean up Stripe Elements when payment modal is closed
    if (modalId === 'paymentModal' && cardElement) {
      try {
        cardElement.unmount();
        cardElement.destroy();
        cardElement = null;
      } catch (e) {
        // Element might not be mounted, ignore
        cardElement = null;
      }
      
      // Clear card element container
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer) {
        cardElementContainer.innerHTML = '';
      }
      
      // Clear any error messages
      const cardErrors = document.getElementById('card-errors');
      if (cardErrors) {
        cardErrors.textContent = '';
      }
    }
  }
}

function openLoginModal() {
  closeModal('signupModal');
  closeModal('paymentModal');
  closeModal('postPurchaseModal');
  openModal('loginModal');
}

function openSignupModal() {
  closeModal('loginModal');
  closeModal('paymentModal');
  closeModal('postPurchaseModal');
  
  // Reset signup form to step 1
  document.getElementById('signup-step-1').classList.remove('hidden');
  document.getElementById('signup-step-2').classList.add('hidden');
  
  // Reset plan selection
  selectedPlan = null;
  document.querySelectorAll('[id^="plan-btn-"]').forEach(btn => {
    btn.classList.remove('border-emerald-500', 'bg-emerald-500/10');
    btn.classList.add('border-slate-700');
  });
  
  const proceedBtn = document.getElementById('proceed-btn');
  if (proceedBtn) {
    proceedBtn.disabled = true;
    proceedBtn.classList.add('bg-slate-700', 'text-slate-400', 'cursor-not-allowed');
    proceedBtn.classList.remove('bg-emerald-500', 'text-black', 'hover:bg-emerald-600');
  }
  
  openModal('signupModal');
}

function switchToSignup() {
  closeModal('loginModal');
  openSignupModal();
}

function switchToLogin() {
  closeModal('signupModal');
  openLoginModal();
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Authentication Functions
async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email') || event.target.querySelector('input[type="email"]').value;
  const password = formData.get('password') || event.target.querySelector('input[type="password"]').value;

  try {
    // In production, this would call your backend API
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    
    // For demo purposes, simulate login
    localStorage.setItem('verishelf_user', JSON.stringify({
      email,
      name: 'User',
      loggedIn: true
    }));

    alert('Login successful! Redirecting to dashboard...');
    closeModal('loginModal');
    
    // Redirect to dashboard
    window.location.href = '/app/';
  } catch (error) {
    alert('Login failed. Please check your credentials.');
    console.error('Login error:', error);
  }
}

// Plan selection in signup modal
function selectSignupPlan(planKey) {
  selectedPlan = plans[planKey];
  
  if (!selectedPlan) {
    alert('Invalid plan selected');
    return;
  }

  // Update UI to show selected plan
  document.querySelectorAll('[id^="plan-btn-"]').forEach(btn => {
    btn.classList.remove('border-emerald-500', 'bg-emerald-500/10');
    btn.classList.add('border-slate-700');
  });

  const selectedBtn = document.getElementById(`plan-btn-${planKey}`);
  if (selectedBtn) {
    selectedBtn.classList.add('border-emerald-500', 'bg-emerald-500/10');
    selectedBtn.classList.remove('border-slate-700');
  }

  // Enable proceed button
  const proceedBtn = document.getElementById('proceed-btn');
  if (proceedBtn) {
    proceedBtn.disabled = false;
    proceedBtn.classList.remove('bg-slate-700', 'text-slate-400', 'cursor-not-allowed');
    proceedBtn.classList.add('bg-emerald-500', 'text-black', 'hover:bg-emerald-600');
  }
}

function proceedToSignupForm() {
  if (!selectedPlan) {
    alert('Please select a plan first');
    return;
  }

  // Hide step 1, show step 2
  document.getElementById('signup-step-1').classList.add('hidden');
  document.getElementById('signup-step-2').classList.remove('hidden');
}

function goBackToPlanSelection() {
  // Hide step 2, show step 1
  document.getElementById('signup-step-2').classList.add('hidden');
  document.getElementById('signup-step-1').classList.remove('hidden');
}

async function handleSignup(event) {
  event.preventDefault();
  
  if (!selectedPlan) {
    alert('Please select a plan first');
    goBackToPlanSelection();
    return;
  }

  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const company = document.getElementById('signup-company').value;

  // Store user info temporarily (before payment)
  const userData = {
    name,
    email,
    password,
    company,
    selectedPlan: selectedPlan.name,
    planKey: Object.keys(plans).find(key => plans[key].name === selectedPlan.name)
  };
  localStorage.setItem('pending_signup', JSON.stringify(userData));

  // Close signup modal and open payment modal
  closeModal('signupModal');
  openPaymentModal();
}

// Plan Selection (from pricing cards - redirects to signup)
function selectPlan(planKey) {
  selectedPlan = plans[planKey];
  
  if (!selectedPlan) {
    alert('Invalid plan selected');
    return;
  }

  // Always go to signup flow
  openSignupModal();
  
  // Pre-select the plan
  setTimeout(() => {
    selectSignupPlan(planKey);
  }, 100);
}

// Payment Modal
function openPaymentModal() {
  if (!selectedPlan) {
    // Try to get plan from pending signup
    const pendingSignup = JSON.parse(localStorage.getItem('pending_signup') || '{}');
    if (pendingSignup.planKey && plans[pendingSignup.planKey]) {
      selectedPlan = plans[pendingSignup.planKey];
    }
  }

  if (!selectedPlan) {
    alert('Please select a plan first');
    openSignupModal();
    return;
  }

  // Get current location count - check both possible IDs
  const locationInput = document.getElementById('locationCount') || document.getElementById('location-count');
  const locationCount = parseInt(locationInput?.value || '1') || 1;
  
  // Calculate pricing with discount
  const discountTier = getDiscountTier(locationCount);
  const pricePerLocation = Math.round(selectedPlan.basePrice * (1 - discountTier.discount));
  const totalPrice = pricePerLocation * locationCount;
  
  // Update payment info in modal
  const planNameEl = document.getElementById('selectedPlanName');
  const planLocationsEl = document.getElementById('selectedPlanLocations');
  const planPricePerLocationEl = document.getElementById('selectedPlanPricePerLocation');
  const planTotalPriceEl = document.getElementById('selectedPlanPrice');
  
  if (planNameEl) planNameEl.textContent = selectedPlan.name;
  if (planLocationsEl) planLocationsEl.textContent = locationCount;
  if (planPricePerLocationEl) planPricePerLocationEl.textContent = `$${pricePerLocation.toLocaleString()}`;
  if (planTotalPriceEl) planTotalPriceEl.textContent = `$${totalPrice.toLocaleString()}/month`;

  openModal('paymentModal');

  // Wait for modal to be visible before initializing Stripe Elements
  setTimeout(() => {
    // Initialize Stripe Elements if not already done
    if (!stripe || !elements) {
      console.warn('Stripe not initialized. Please configure your Stripe publishable key.');
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        displayError.textContent = 'Payment system is not available. Please refresh the page.';
      }
      return;
    }

    // Check if card element already exists and is mounted
    const cardElementContainer = document.getElementById('card-element');
    if (!cardElementContainer) {
      console.error('Card element container not found');
      return;
    }

    // Unmount and destroy existing element if it exists
    if (cardElement) {
      try {
        cardElement.unmount();
        cardElement.destroy();
      } catch (e) {
        // Element might not be mounted, ignore
        console.log('No existing card element to unmount');
      }
      cardElement = null;
    }

    // Clear any existing content in the container
    cardElementContainer.innerHTML = '';

    const style = {
      base: {
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#64748b',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    };

    try {
      // Create new card element
      cardElement = elements.create('card', { style });
      cardElement.mount('#card-element');

      // Handle real-time validation errors
      cardElement.on('change', ({ error }) => {
        const displayError = document.getElementById('card-errors');
        if (displayError) {
          if (error) {
            displayError.textContent = error.message;
          } else {
            displayError.textContent = '';
          }
        }
      });

      console.log('✅ Stripe Elements mounted successfully');
    } catch (error) {
      console.error('❌ Error creating Stripe Elements:', error);
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        displayError.textContent = 'Error loading payment form: ' + error.message;
      }
    }
  }, 100);
}

// Payment Processing
async function handlePayment(event) {
  event.preventDefault();
  const submitButton = document.getElementById('submit-button');
  const cardErrors = document.getElementById('card-errors');

  if (!stripe || !cardElement) {
    alert('Stripe is not initialized. Please check your configuration.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Processing...';

  try {
    // Get pending signup data
    const pendingSignup = JSON.parse(localStorage.getItem('pending_signup') || '{}');
    
    // Get location count - check both possible IDs
    const locationInput = document.getElementById('locationCount') || document.getElementById('location-count');
    const locationCount = parseInt(locationInput?.value || '1') || 1;
    
    if (!pendingSignup.email) {
      throw new Error('Please complete signup first');
    }
    
    // Calculate pricing with discount for the subscription
    const discountTier = getDiscountTier(locationCount);
    const pricePerLocation = Math.round(selectedPlan.basePrice * (1 - discountTier.discount));

    // Step 1: Create or get customer
    const customerResponse = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingSignup.email,
        name: pendingSignup.name,
        metadata: {
          company: pendingSignup.company,
          planKey: Object.keys(plans).find(key => plans[key].name === selectedPlan.name)
        }
      })
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.json();
      throw new Error(error.error || 'Failed to create customer');
    }

    const { customerId } = await customerResponse.json();

    // Step 2: Create payment method
    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (pmError) {
      cardErrors.textContent = pmError.message;
      submitButton.disabled = false;
      submitButton.textContent = 'Subscribe Now';
      return;
    }

    // Step 3: Create subscription via backend
    const planKey = Object.keys(plans).find(key => plans[key].name === selectedPlan.name);
    
    const subscriptionResponse = await fetch(`${API_BASE_URL}/subscriptions/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        paymentMethodId: paymentMethod.id,
        planKey,
        locationCount,
        metadata: {
          email: pendingSignup.email,
          name: pendingSignup.name,
          company: pendingSignup.company
        }
      })
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.json();
      throw new Error(error.error || 'Failed to create subscription');
    }

    const { clientSecret, subscriptionId } = await subscriptionResponse.json();

    // Step 4: Confirm payment for subscription
    // For subscriptions, we use confirmPayment with the payment intent client secret
    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id
    });

    if (confirmError) {
      cardErrors.textContent = confirmError.message;
      submitButton.disabled = false;
      submitButton.textContent = 'Subscribe Now';
      return;
    }
    
    // Verify payment was successful
    if (paymentIntent && paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment ${paymentIntent.status}. Please try again.`);
    }

    // Step 5: Store user and subscription info
    const user = {
      name: pendingSignup.name,
      email: pendingSignup.email,
      company: pendingSignup.company,
      customerId: customerId,
      loggedIn: true
    };

    localStorage.setItem('verishelf_user', JSON.stringify(user));
    
    // Use the pricing already calculated above
    const totalPrice = pricePerLocation * locationCount;
    
    localStorage.setItem('verishelf_subscription', JSON.stringify({
      subscriptionId,
      plan: selectedPlan.name,
      planKey,
      price: pricePerLocation,
      basePrice: selectedPlan.basePrice,
      discount: discountTier.discount,
      locationCount: locationCount,
      totalPrice: totalPrice,
      status: 'active',
      startDate: new Date().toISOString(),
      paymentMethodId: paymentMethod.id
    }));

    // Clear pending signup
    localStorage.removeItem('pending_signup');

    // Close payment modal
    closeModal('paymentModal');

    // Show success and redirect
    alert('Account created and subscription activated! Redirecting to dashboard...');
    window.location.href = '/app/';

  } catch (error) {
    console.error('Payment error:', error);
    cardErrors.textContent = error.message || 'An error occurred. Please try again.';
    submitButton.disabled = false;
    submitButton.textContent = 'Subscribe Now';
  }
}

// Post-Purchase Signup
function openPostPurchaseModal() {
  const user = JSON.parse(localStorage.getItem('verishelf_user') || '{}');
  
  // Pre-fill email if available
  if (user.email) {
    document.getElementById('pp-email').value = user.email;
  }
  
  openModal('postPurchaseModal');
}

async function handlePostPurchaseSignup(event) {
  event.preventDefault();
  const form = event.target;
  const name = document.getElementById('pp-name').value;
  const email = document.getElementById('pp-email').value;
  const password = document.getElementById('pp-password').value;
  const company = document.getElementById('pp-company').value;

  try {
    // Update user info
    const user = {
      name,
      email,
      company,
      loggedIn: true
    };

    localStorage.setItem('verishelf_user', JSON.stringify(user));

    // In production, this would call your backend API
    // await fetch(`${API_BASE_URL}/auth/complete-profile`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, password, company })
    // });

    alert('Account setup complete! Redirecting to dashboard...');
    closeModal('postPurchaseModal');
    
    // Redirect to dashboard
    window.location.href = '/app/';
  } catch (error) {
    alert('Setup failed. Please try again.');
    console.error('Post-purchase signup error:', error);
  }
}

// Contact Form
function openContactForm() {
  // Scroll to contact section or open a modal
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Mobile Menu Toggle
document.getElementById('mobile-menu-button')?.addEventListener('click', function() {
  const menu = document.getElementById('mobile-menu');
  menu?.classList.toggle('hidden');
});

// Close mobile menu when clicking links
document.querySelectorAll('#mobile-menu a, #mobile-menu button').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.add('hidden');
  });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offset = 80;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.animate-slide-up').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Initialize pricing on page load
window.addEventListener('load', () => {
  updatePricing();
  
  const pendingSignup = localStorage.getItem('pending_signup');
  if (pendingSignup) {
    const data = JSON.parse(pendingSignup);
    if (data.planKey && plans[data.planKey]) {
      // Restore plan selection
      selectedPlan = plans[data.planKey];
      // Show payment modal
      setTimeout(() => {
        openPaymentModal();
      }, 500);
    }
  }
});

// Check if user is already logged in
window.addEventListener('load', () => {
  const user = JSON.parse(localStorage.getItem('verishelf_user') || '{}');
  if (user.loggedIn) {
    // Update nav to show user info
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
      const loginButton = navMenu.querySelector('button[onclick="openLoginModal()"]');
      if (loginButton) {
        loginButton.textContent = user.name || user.email || 'Account';
        loginButton.onclick = () => {
          // Show account menu or redirect to dashboard
          window.location.href = '/app/';
        };
      }
    }
  }
});
