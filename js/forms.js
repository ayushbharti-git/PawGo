/**
 * ==============================================================================
 * PawGo - Form Validation & Asynchronous JSON Submission (forms.js)
 * ==============================================================================
 * 
 * Course Evaluation 2: Forms & Form Submission Requirements
 * Classroom Concepts Demonstrated:
 *   - Variables: const and let (block scope)
 *   - Objects: structured payloads for HTTP JSON requests
 *   - Strings: trim(), length checks, regex pattern matching
 *   - Functions: reusable validation and state helpers
 *   - Asynchronous JavaScript: async/await, Promises, fetch() API
 *   - Safe DOM Methods: textContent, createElement, classList
 *   - UX: loading states, duplicate submission prevention, accessible inline errors
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Booking Form
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    setupBookingForm(bookingForm);
  }

  // 2. Initialize Contact Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    setupContactForm(contactForm);
  }

  // 3. Initialize Provider Form
  const providerForm = document.getElementById('provider-form');
  if (providerForm) {
    setupProviderForm(providerForm);
  }

  // 4. Initialize Newsletter Forms
  const newsletterForms = document.querySelectorAll('.cta-form');
  newsletterForms.forEach((form) => {
    setupNewsletterForm(form);
  });
});

// ==============================================================================
// Validation Helper Functions
// ==============================================================================

/**
 * Validates standard email address format
 */
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Validates phone numbers (at least 7 digits, digits/hyphens/spaces/plus allowed)
 */
function isValidPhone(phone) {
  const cleanDigits = phone.replace(/[^0-9]/g, '');
  return cleanDigits.length >= 7 && cleanDigits.length <= 15;
}

/**
 * Clears any existing inline error messages for a form
 */
function clearFormErrors(form) {
  const errorElements = form.querySelectorAll('.inline-error');
  errorElements.forEach((el) => {
    el.textContent = '';
    el.style.display = 'none';
  });

  const invalidInputs = form.querySelectorAll('.has-error');
  invalidInputs.forEach((input) => {
    input.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
  });

  const banner = form.querySelector('.form-alert');
  if (banner) {
    banner.remove();
  }
}

/**
 * Displays an inline error message beneath an input field
 */
function setFieldError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.add('has-error');
  field.setAttribute('aria-invalid', 'true');

  let errorContainer = document.getElementById(`${fieldId}-error`);
  if (!errorContainer) {
    errorContainer = document.createElement('span');
    errorContainer.id = `${fieldId}-error`;
    errorContainer.className = 'inline-error';
    errorContainer.setAttribute('role', 'alert');
    field.parentElement.appendChild(errorContainer);
  }

  errorContainer.textContent = errorMessage;
  errorContainer.style.display = 'block';
}

/**
 * Shows a banner alert (success or error) inside the form
 */
function showFormBanner(form, message, type = 'error') {
  let banner = form.querySelector('.form-alert');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = `form-alert alert-${type}`;
    banner.setAttribute('role', 'alert');
    form.prepend(banner);
  } else {
    banner.className = `form-alert alert-${type}`;
  }
  banner.textContent = message;
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==============================================================================
// 1. Booking Form Handler
// ==============================================================================

function setupBookingForm(form) {
  let isSubmitting = false;

  // Real-time price estimator
  const serviceSelect = document.getElementById('booking-service');
  const petTypeSelect = document.getElementById('booking-pet-type');
  const priceDisplay = document.getElementById('booking-estimate-price');

  const baseRates = {
    'walking': 18,
    'grooming': 45,
    'veterinary': 60,
    'sitting': 35,
    'taxi': 25
  };

  function updateEstimate() {
    if (!priceDisplay || !serviceSelect) return;
    const selectedService = serviceSelect.value;
    const base = baseRates[selectedService] || 30;
    const petType = petTypeSelect ? petTypeSelect.value : 'dog';
    const multiplier = petType === 'cat' ? 0.9 : 1.0;
    const total = Math.round(base * multiplier);
    priceDisplay.textContent = `$${total}.00`;
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', updateEstimate);
  }
  if (petTypeSelect) {
    petTypeSelect.addEventListener('change', updateEstimate);
  }
  updateEstimate();

  // Submit event handling
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent duplicate submission

    clearFormErrors(form);

    // Collect and trim values
    const ownerName = document.getElementById('booking-owner-name').value.trim();
    const email = document.getElementById('booking-email').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const petName = document.getElementById('booking-pet-name').value.trim();
    const petType = document.getElementById('booking-pet-type').value;
    const petBreed = (document.getElementById('booking-pet-breed') ? document.getElementById('booking-pet-breed').value.trim() : '') || 'Mixed / Unknown';
    const service = document.getElementById('booking-service').value;
    const date = document.getElementById('booking-date').value;
    const timeSlot = document.getElementById('booking-time-slot').value;
    const notes = document.getElementById('booking-notes') ? document.getElementById('booking-notes').value.trim() : '';

    // Validate fields
    let isValid = true;

    if (!ownerName || ownerName.length < 2) {
      setFieldError('booking-owner-name', 'Please enter your full name (at least 2 letters).');
      isValid = false;
    }

    if (!email || !isValidEmail(email)) {
      setFieldError('booking-email', 'Please enter a valid email address (e.g. name@domain.com).');
      isValid = false;
    }

    if (!phone || !isValidPhone(phone)) {
      setFieldError('booking-phone', 'Please enter a valid phone number (minimum 7 digits).');
      isValid = false;
    }

    if (!petName || petName.length < 2) {
      setFieldError('booking-pet-name', 'Please enter your pet\'s name.');
      isValid = false;
    }

    if (!petType) {
      setFieldError('booking-pet-type', 'Please select your pet type.');
      isValid = false;
    }

    if (!service) {
      setFieldError('booking-service', 'Please select a pet care service.');
      isValid = false;
    }

    if (!date) {
      setFieldError('booking-date', 'Please choose a date for the appointment.');
      isValid = false;
    } else {
      // Ensure date is not in the past
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setFieldError('booking-date', 'Appointment date cannot be in the past.');
        isValid = false;
      }
    }

    if (!timeSlot) {
      setFieldError('booking-time-slot', 'Please select a preferred time slot.');
      isValid = false;
    }

    if (!isValid) {
      showFormBanner(form, 'Please correct the highlighted errors above.', 'error');
      return;
    }

    // Build structured payload object
    const payload = {
      type: 'booking',
      ownerName,
      email,
      phone,
      petName,
      petType,
      petBreed,
      service,
      date,
      timeSlot,
      notes
    };

    // Submit to server
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Submit';

    try {
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Securing Booking...';
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Successful storage
        showFormBanner(form, 'Booking confirmed! Redirecting to your confirmation details...', 'success');
        
        // Save confirmation record to sessionStorage for confirmation.html
        if (result.record) {
          sessionStorage.setItem('lastPawGoSubmission', JSON.stringify(result.record));
        }

        setTimeout(() => {
          window.location.href = `confirmation.html?id=${result.record ? result.record.id : 'pwg'}&type=booking`;
        }, 1200);

      } else {
        // Backend validation errors
        const errorMsg = (result.errors && result.errors.join(' ')) || result.error || 'Submission failed. Please try again.';
        showFormBanner(form, errorMsg, 'error');
      }
    } catch (networkError) {
      console.error('Network or server error:', networkError);
      showFormBanner(form, 'Unable to connect to the server. Please verify the server is running on port 3000.', 'error');
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

// ==============================================================================
// 2. Contact Form Handler
// ==============================================================================

function setupContactForm(form) {
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    clearFormErrors(form);

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();

    let isValid = true;

    if (!name || name.length < 2) {
      setFieldError('contact-name', 'Please provide your name (at least 2 characters).');
      isValid = false;
    }

    if (!email || !isValidEmail(email)) {
      setFieldError('contact-email', 'Please provide a valid email address.');
      isValid = false;
    }

    if (!subject) {
      setFieldError('contact-subject', 'Please select a topic for your message.');
      isValid = false;
    }

    if (!message || message.length < 10) {
      setFieldError('contact-message', 'Message must be at least 10 characters long.');
      isValid = false;
    }

    if (!isValid) {
      showFormBanner(form, 'Please fix the errors below before sending.', 'error');
      return;
    }

    const payload = {
      type: 'contact',
      name,
      email,
      subject,
      message
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Send Message';

    try {
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Message...';
      }

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showFormBanner(form, 'Thank you! Your message has been sent and saved.', 'success');
        form.reset();

        if (result.record) {
          sessionStorage.setItem('lastPawGoSubmission', JSON.stringify(result.record));
        }

        setTimeout(() => {
          window.location.href = `confirmation.html?id=${result.record ? result.record.id : 'pwg'}&type=contact`;
        }, 1500);

      } else {
        const errorMsg = (result.errors && result.errors.join(' ')) || result.error || 'Failed to send message.';
        showFormBanner(form, errorMsg, 'error');
      }
    } catch (networkError) {
      console.error('Contact submission error:', networkError);
      showFormBanner(form, 'Network error. Please make sure the backend server is running.', 'error');
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

// ==============================================================================
// 3. Provider / Caregiver Registration Form Handler
// ==============================================================================

function setupProviderForm(form) {
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    clearFormErrors(form);

    const name = document.getElementById('provider-name').value.trim();
    const email = document.getElementById('provider-email').value.trim();
    const phone = document.getElementById('provider-phone').value.trim();
    const specialty = document.getElementById('provider-specialty').value;
    const experienceYears = document.getElementById('provider-experience').value.trim();
    const city = document.getElementById('provider-city').value.trim();
    const bio = document.getElementById('provider-bio').value.trim();
    const agreementCheckbox = document.getElementById('provider-agreement');
    const agreement = agreementCheckbox ? agreementCheckbox.checked : false;

    let isValid = true;

    if (!name || name.length < 2) {
      setFieldError('provider-name', 'Full name is required (minimum 2 characters).');
      isValid = false;
    }

    if (!email || !isValidEmail(email)) {
      setFieldError('provider-email', 'Please provide a valid email address.');
      isValid = false;
    }

    if (!phone || !isValidPhone(phone)) {
      setFieldError('provider-phone', 'Please enter a valid phone number (minimum 7 digits).');
      isValid = false;
    }

    if (!specialty) {
      setFieldError('provider-specialty', 'Please select your primary specialty.');
      isValid = false;
    }

    if (!experienceYears || isNaN(experienceYears) || Number(experienceYears) < 0) {
      setFieldError('provider-experience', 'Please enter your years of pet care experience (0 or more).');
      isValid = false;
    }

    if (!city || city.length < 2) {
      setFieldError('provider-city', 'Please enter your operating city/region.');
      isValid = false;
    }

    if (!bio || bio.length < 20) {
      setFieldError('provider-bio', 'Please tell us about yourself and your care background (at least 20 characters).');
      isValid = false;
    }

    if (!agreement) {
      setFieldError('provider-agreement', 'You must agree to PawGo Care & Safety Standards.');
      isValid = false;
    }

    if (!isValid) {
      showFormBanner(form, 'Please resolve all required fields.', 'error');
      return;
    }

    const payload = {
      type: 'provider',
      name,
      email,
      phone,
      specialty,
      experienceYears: parseInt(experienceYears, 10),
      city,
      bio,
      agreement
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Apply Now';

    try {
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Application...';
      }

      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showFormBanner(form, 'Application submitted successfully! Redirecting...', 'success');
        form.reset();

        if (result.record) {
          sessionStorage.setItem('lastPawGoSubmission', JSON.stringify(result.record));
        }

        setTimeout(() => {
          window.location.href = `confirmation.html?id=${result.record ? result.record.id : 'pwg'}&type=provider`;
        }, 1500);

      } else {
        const errorMsg = (result.errors && result.errors.join(' ')) || result.error || 'Submission failed.';
        showFormBanner(form, errorMsg, 'error');
      }
    } catch (networkError) {
      console.error('Provider application error:', networkError);
      showFormBanner(form, 'Connection error. Please ensure server is running.', 'error');
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

// ==============================================================================
// 4. Newsletter Subscription Form Handler
// ==============================================================================

function setupNewsletterForm(form) {
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
      alert('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Subscribe';

    try {
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
      }

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'newsletter', email })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (typeof showNotification === 'function') {
          showNotification('🎉 Welcome to PawGo Club! 20% discount code sent to your email.', 'success');
        } else {
          alert('🎉 Welcome to PawGo Club! 20% discount code sent to your email.');
        }
        form.reset();
      } else {
        alert(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      alert('Could not connect to server.');
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

