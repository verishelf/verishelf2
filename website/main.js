// VeriShelf Website - Authentication & Stripe Integration

// Configuration
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SkhdR9ELeRLvDS57hteUCEnMzmsWIGbY5VECFeRHLKShcU6j9144UwCsO6o2TIgDdMWJ7uCKu37Djo5ceTXdd8J00kdAi7eNV';
const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your backend API URL

// Supabase Configuration
const SUPABASE_URL = 'https://bblwhwobkthawkbyhiwb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1aD8kxQVjJqLjo2LoSx7Ww_f6ucmEvS';

// Initialize Supabase Client (will be initialized on window load)
let supabaseClient = null;

// Initialize Stripe
let stripe = null;
let elements = null;
let cardElement = null;

if (STRIPE_PUBLISHABLE_KEY) {
  try {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements();
    console.log('Stripe initialized successfully');
  } catch (error) {
    console.error('Error initializing Stripe:', error);
  }
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
function getDiscount(locationCount) {
  if (locationCount >= 201) return 0.30; // 30% discount
  if (locationCount >= 101) return 0.25; // 25% discount
  if (locationCount >= 51) return 0.20;  // 20% discount
  if (locationCount >= 26) return 0.15;  // 15% discount
  if (locationCount >= 11) return 0.10;  // 10% discount
  if (locationCount >= 6) return 0.05;   // 5% discount
  return 0; // No discount
}

// Get number of locations from input
function getLocationCount() {
  const input = document.getElementById('location-count');
  return Math.max(1, parseInt(input?.value || 1) || 1);
}

// Update pricing based on location count
function updatePricing() {
  const locationCount = getLocationCount();
  const discount = getDiscount(locationCount);
  const discountPercent = Math.round(discount * 100);
  
  // Update Professional plan
  const professionalPrice = plans.professional.basePrice * (1 - discount);
  const professionalTotal = professionalPrice * locationCount;
  document.getElementById('price-professional').textContent = `$${Math.round(professionalPrice)}`;
  document.getElementById('total-professional').textContent = locationCount > 1 
    ? `$${Math.round(professionalTotal).toLocaleString()}/month total` 
    : '';
  
  // Update Enterprise plan
  const enterprisePrice = plans.enterprise.basePrice * (1 - discount);
  const enterpriseTotal = enterprisePrice * locationCount;
  document.getElementById('price-enterprise').textContent = `$${Math.round(enterprisePrice)}`;
  document.getElementById('total-enterprise').textContent = locationCount > 1 
    ? `$${Math.round(enterpriseTotal).toLocaleString()}/month total` 
    : '';
  
  // Update signup modal plan buttons if modal is open - show TOTAL price
  const professionalBtn = document.getElementById('plan-btn-professional');
  const enterpriseBtn = document.getElementById('plan-btn-enterprise');
  
  if (professionalBtn) {
    const priceEl = professionalBtn.querySelector('.text-2xl');
    const subtitleEl = professionalBtn.querySelector('.text-xs');
    if (priceEl) {
      // Show total price, not per location
      priceEl.textContent = `$${Math.round(professionalTotal).toLocaleString()}/month`;
    }
    if (subtitleEl) {
      if (locationCount > 1) {
        subtitleEl.textContent = `$${Math.round(professionalPrice)}/location${discount > 0 ? ` (${discountPercent}% off)` : ''} • ${locationCount} locations`;
      } else {
        subtitleEl.textContent = `$${Math.round(professionalPrice)}/location${discount > 0 ? ` (${discountPercent}% off)` : ''}`;
      }
    }
  }
  
  if (enterpriseBtn) {
    const priceEl = enterpriseBtn.querySelector('.text-2xl');
    const subtitleEl = enterpriseBtn.querySelector('.text-xs');
    if (priceEl) {
      // Show total price, not per location
      priceEl.textContent = `$${Math.round(enterpriseTotal).toLocaleString()}/month`;
    }
    if (subtitleEl) {
      if (locationCount > 1) {
        subtitleEl.textContent = `$${Math.round(enterprisePrice)}/location${discount > 0 ? ` (${discountPercent}% off)` : ''} • ${locationCount} locations`;
      } else {
        subtitleEl.textContent = `$${Math.round(enterprisePrice)}/location${discount > 0 ? ` (${discountPercent}% off)` : ''}`;
      }
    }
  }
  
  // Update signup step 2 price if visible
  if (selectedPlan && document.getElementById('signup-step-2') && !document.getElementById('signup-step-2').classList.contains('hidden')) {
    updateSignupStep2Price();
  }
  
  // Update discount info
  const discountText = document.getElementById('discount-text');
  const savingsText = document.getElementById('savings-text');
  
  if (discount > 0) {
    discountText.textContent = `${discountPercent}% volume discount applied`;
    discountText.classList.remove('text-slate-400');
    discountText.classList.add('text-emerald-400', 'font-semibold');
    
    // Calculate savings
    const professionalSavings = (plans.professional.basePrice * locationCount) - professionalTotal;
    const enterpriseSavings = (plans.enterprise.basePrice * locationCount) - enterpriseTotal;
    savingsText.textContent = `Save up to $${Math.round(Math.max(professionalSavings, enterpriseSavings)).toLocaleString()}/month`;
    savingsText.classList.remove('hidden');
  } else {
    discountText.textContent = 'Enter more locations for volume discounts';
    discountText.classList.remove('text-emerald-400', 'font-semibold');
    discountText.classList.add('text-slate-400');
    savingsText.textContent = '';
    savingsText.classList.add('hidden');
  }
  
  // Update plan prices in memory
  plans.professional.price = Math.round(professionalPrice);
  plans.enterprise.price = Math.round(enterprisePrice);
  
  // If a plan is already selected, update its display
  if (selectedPlan) {
    selectSignupPlan(Object.keys(plans).find(key => plans[key].name === selectedPlan.name));
  }
}

// Increment/Decrement location count
function incrementLocations() {
  const input = document.getElementById('location-count');
  if (input) {
    input.value = parseInt(input.value || 1) + 1;
    updatePricing();
  }
}

function decrementLocations() {
  const input = document.getElementById('location-count');
  if (input) {
    const current = parseInt(input.value || 1);
    if (current > 1) {
      input.value = current - 1;
      updatePricing();
    }
  }
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
  
  // Update prices based on current location count
  updatePricing();
  
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

// Helper function to ensure Supabase is initialized
function ensureSupabase() {
  if (!supabaseClient) {
    // Try to initialize one more time
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (e) {
        console.error('Failed to initialize Supabase:', e);
      }
    }
  }
  return supabaseClient !== null;
}

// Authentication Functions
async function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const email = formData.get('email') || event.target.querySelector('input[type="email"]').value;
  const password = formData.get('password') || event.target.querySelector('input[type="password"]').value;

  if (!ensureSupabase()) {
    alert('Authentication service is not available. Please refresh the page.');
    return;
  }

  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      throw authError;
    }

    // Get user profile from database
    const { data: profileData, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    // Store user info in localStorage
    const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: profileData?.name || authData.user.email?.split('@')[0] || 'User',
      company: profileData?.company || '',
      loggedIn: true,
      session: authData.session
    };

    localStorage.setItem('verishelf_user', JSON.stringify(user));
    localStorage.setItem('supabase_session', JSON.stringify(authData.session));

    alert('Login successful! Redirecting to dashboard...');
    closeModal('loginModal');
    
    // Redirect to dashboard
    window.location.href = '/dashboard/';
  } catch (error) {
    alert('Login failed: ' + (error.message || 'Please check your credentials.'));
    console.error('Login error:', error);
  }
}

// Update plan prices in signup modal based on location count
function updateSignupPlanPrices() {
  const locationCount = getLocationCount();
  const discount = getDiscount(locationCount);
  const discountPercent = Math.round(discount * 100);
  
  // Update both plan buttons
  Object.keys(plans).forEach(planKey => {
    const plan = plans[planKey];
    const btn = document.getElementById(`plan-btn-${planKey}`);
    if (btn) {
      const pricePerLocation = plan.basePrice * (1 - discount);
      const totalPrice = pricePerLocation * locationCount;
      
      // Update price display
      const priceElement = btn.querySelector('.text-2xl');
      if (priceElement) {
        priceElement.textContent = `$${Math.round(totalPrice).toLocaleString()}/month`;
      }
      
      // Update subtitle to show per location price and discount
      const subtitleElement = btn.querySelector('.text-xs');
      if (subtitleElement) {
        if (locationCount > 1) {
          subtitleElement.textContent = `$${Math.round(pricePerLocation)}/location${discount > 0 ? ` (${discountPercent}% off)` : ''} • ${locationCount} locations`;
        } else {
          subtitleElement.textContent = `$${Math.round(pricePerLocation)}/location${discount > 0 ? ` (${discountPercent}% off)` : ''}`;
        }
      }
    }
  });
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
    
    // Update price display
    updateSignupPlanPrices();
  }

  // Enable proceed button
  const proceedBtn = document.getElementById('proceed-btn');
  if (proceedBtn) {
    proceedBtn.disabled = false;
    proceedBtn.classList.remove('bg-slate-700', 'text-slate-400', 'cursor-not-allowed');
    proceedBtn.classList.add('bg-emerald-500', 'text-black', 'hover:bg-emerald-600');
  }
}

// Update price display in signup step 2
function updateSignupStep2Price() {
  if (!selectedPlan) return;
  
  const locationCount = getLocationCount();
  const discount = getDiscount(locationCount);
  const pricePerLocation = selectedPlan.basePrice * (1 - discount);
  const totalPrice = pricePerLocation * locationCount;
  const discountPercent = Math.round(discount * 100);
  
  // Update price display in step 2
  const priceDisplay = document.getElementById('signup-step-2-price');
  if (priceDisplay) {
    priceDisplay.innerHTML = `
      <div class="p-4 bg-slate-800 rounded-lg mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-slate-300">Plan:</span>
          <span class="text-white font-semibold">${selectedPlan.name}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-slate-300">Locations:</span>
          <span class="text-white font-semibold">${locationCount}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-slate-300">Price per location:</span>
          <span class="text-emerald-400 font-semibold">$${Math.round(pricePerLocation)}${discount > 0 ? ` <span class="text-xs">(${discountPercent}% off)</span>` : ''}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-slate-700">
          <span class="text-slate-300 font-semibold">Total monthly:</span>
          <span class="text-emerald-400 font-bold text-xl">$${Math.round(totalPrice).toLocaleString()}</span>
        </div>
      </div>
    `;
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
  
  // Update price display in step 2
  updateSignupStep2Price();
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

  // Get location count and calculate final price
  const locationCount = getLocationCount();
  const discount = getDiscount(locationCount);
  const pricePerLocation = selectedPlan.basePrice * (1 - discount);
  const finalPrice = pricePerLocation * locationCount;
  const discountPercent = Math.round(discount * 100);
  
  // Update payment info
  document.getElementById('selectedPlanName').textContent = selectedPlan.name;
  document.getElementById('selectedPlanLocations').textContent = `${locationCount} location${locationCount > 1 ? 's' : ''}`;
  document.getElementById('selectedPlanPricePerLocation').textContent = `$${Math.round(pricePerLocation)}${discount > 0 ? ` (${discountPercent}% off)` : ''}`;
  document.getElementById('selectedPlanPrice').textContent = `$${Math.round(finalPrice).toLocaleString()}/month`;
  
  // Store location count for payment processing
  selectedPlan.locationCount = locationCount;
  selectedPlan.finalPrice = Math.round(finalPrice);
  selectedPlan.pricePerLocation = Math.round(pricePerLocation);

  openModal('paymentModal');

  // Wait for modal to be visible before mounting Stripe Elements
  setTimeout(() => {
    // Initialize Stripe Elements if not already done
    if (!stripe) {
      console.error('Stripe is not initialized. Please check your publishable key.');
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        displayError.textContent = 'Payment system is not available. Please refresh the page.';
      }
      return;
    }

    // Unmount existing element if it exists
    if (cardElement) {
      try {
        cardElement.unmount();
        cardElement = null;
      } catch (e) {
        console.log('No existing card element to unmount');
      }
    }

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
      cardElement = elements.create('card', { style });
      cardElement.mount('#card-element');

      // Handle real-time validation errors
      cardElement.on('change', ({ error }) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
          displayError.textContent = error.message;
        } else {
          displayError.textContent = '';
        }
      });
      
      console.log('Stripe Elements mounted successfully');
    } catch (error) {
      console.error('Error mounting Stripe Elements:', error);
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
    // Create payment method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      cardErrors.textContent = error.message;
      submitButton.disabled = false;
      submitButton.textContent = 'Subscribe Now';
      return;
    }

    // In production, send paymentMethod.id to your backend
    // const response = await fetch(`${API_BASE_URL}/subscriptions/create`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${getAuthToken()}`
    //   },
    //   body: JSON.stringify({
    //     paymentMethodId: paymentMethod.id,
    //     priceId: selectedPlan.priceId,
    //   })
    // });

    // Get pending signup data
    const pendingSignup = JSON.parse(localStorage.getItem('pending_signup') || '{}');
    
    if (!ensureSupabase()) {
      throw new Error('Database service is not available. Please refresh the page.');
    }

    // Create user account in Supabase
    const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
      email: pendingSignup.email,
      password: pendingSignup.password,
      options: {
        data: {
          name: pendingSignup.name,
          company: pendingSignup.company
        }
      }
    });

    if (signUpError) {
      // Check if error is due to user already existing
      const errorMessage = signUpError.message?.toLowerCase() || '';
      if (errorMessage.includes('already registered') || 
          errorMessage.includes('user already registered') ||
          errorMessage.includes('email already') ||
          signUpError.status === 422) {
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe Now';
        closeModal('paymentModal');
        alert('An account with this email already exists. Please login instead.');
        openModal('loginModal');
        // Pre-fill email in login form
        setTimeout(() => {
          const loginEmail = document.getElementById('login-email');
          if (loginEmail) {
            loginEmail.value = pendingSignup.email;
          }
        }, 100);
        return;
      }
      throw new Error('Failed to create account: ' + signUpError.message);
    }

    // Create user profile in database
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert({
        id: authData.user.id,
        email: pendingSignup.email,
        name: pendingSignup.name,
        company: pendingSignup.company,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Continue anyway as auth user is created
    }

    // Create subscription record in database
    const locationCount = selectedPlan.locationCount || 1;
    const { error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: authData.user.id,
        plan: selectedPlan.name,
        plan_key: Object.keys(plans).find(key => plans[key].name === selectedPlan.name),
        price: selectedPlan.finalPrice || selectedPlan.price,
        price_per_location: selectedPlan.pricePerLocation || selectedPlan.basePrice,
        location_count: locationCount,
        base_price: selectedPlan.basePrice,
        discount: getDiscount(locationCount),
        status: 'active',
        start_date: new Date().toISOString(),
        payment_method_id: paymentMethod.id,
        stripe_payment_method_id: paymentMethod.id
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      // Continue anyway
    }

    // Store user info in localStorage
    const user = {
      id: authData.user.id,
      name: pendingSignup.name,
      email: pendingSignup.email,
      company: pendingSignup.company,
      loggedIn: true,
      session: authData.session
    };

    localStorage.setItem('verishelf_user', JSON.stringify(user));
    if (authData.session) {
      localStorage.setItem('supabase_session', JSON.stringify(authData.session));
    }
    
    // Store subscription info in localStorage
    localStorage.setItem('verishelf_subscription', JSON.stringify({
      plan: selectedPlan.name,
      price: selectedPlan.finalPrice || selectedPlan.price,
      locationCount: locationCount,
      basePrice: selectedPlan.basePrice,
      discount: getDiscount(locationCount),
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
    // Redirect to React app dashboard
    window.location.href = '/dashboard/';

  } catch (error) {
    console.error('Payment error:', error);
    cardErrors.textContent = 'An error occurred. Please try again.';
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

  if (!ensureSupabase()) {
    alert('Database service is not available. Please refresh the page.');
    return;
  }

  try {
    // Create user account in Supabase
    const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company
        }
      }
    });

    if (signUpError) {
      throw new Error('Failed to create account: ' + signUpError.message);
    }

    // Create user profile in database
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        company,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Continue anyway as auth user is created
    }

    // Store user info in localStorage
    const user = {
      id: authData.user.id,
      name,
      email,
      company,
      loggedIn: true,
      session: authData.session
    };

    localStorage.setItem('verishelf_user', JSON.stringify(user));
    if (authData.session) {
      localStorage.setItem('supabase_session', JSON.stringify(authData.session));
    }

    alert('Account setup complete! Redirecting to dashboard...');
    closeModal('postPurchaseModal');
    
    // Redirect to dashboard
    window.location.href = '/dashboard/';
  } catch (error) {
    alert('Setup failed: ' + (error.message || 'Please try again.'));
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
  // Initialize Supabase
  function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
      } catch (error) {
        console.error('Error initializing Supabase:', error);
        return false;
      }
    }
    return false;
  }

  // Try to initialize immediately
  if (!initSupabase()) {
    // Try again after a short delay to ensure CDN is loaded
    setTimeout(() => {
      if (!initSupabase()) {
        console.error('Supabase library not loaded. Please check your internet connection.');
      }
    }, 500);
  }
  
  // Verify Stripe is loaded
  if (typeof Stripe === 'undefined') {
    console.error('Stripe.js library not loaded. Please check your internet connection.');
    alert('Payment system is not available. Please check your internet connection and refresh the page.');
  } else {
    console.log('Stripe.js library loaded successfully');
    
    // Re-initialize Stripe if needed
    if (STRIPE_PUBLISHABLE_KEY && !stripe) {
      try {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        elements = stripe.elements();
        console.log('Stripe initialized on page load');
      } catch (error) {
        console.error('Error initializing Stripe on page load:', error);
      }
    }
  }
  
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
          window.location.href = '/dashboard/';
        };
      }
    }
  }
});
