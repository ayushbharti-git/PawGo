/**
 * ==============================================================================
 * PawGo - Main Frontend JavaScript (main.js)
 * ==============================================================================
 * 
 * Classroom Concepts Demonstrated:
 *   - Variables: const, let
 *   - Arrays and array methods (forEach, filter)
 *   - Functions and arrow functions
 *   - Event Listeners (click, input, DOMContentLoaded)
 *   - Safe DOM manipulation (textContent, createElement, classList)
 *   - Accessibility (aria-expanded, keyboard focus)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Mobile Navigation Menu Toggle
  setupMobileNav();

  // 2. Initialize Shop Add-to-Cart Interaction
  setupShopCart();

  // 3. Initialize Caregiver Directory Search (if on contacts.html)
  setupDirectorySearch();

  // 4. Highlight Active Navigation Link
  highlightActiveNavLink();
});

/**
 * Mobile Navigation Toggle
 * Handles opening and closing the mobile drawer and updating ARIA attributes.
 */
function setupMobileNav() {
  const toggleBtn = document.querySelector('.mobile-menu-btn');
  const mainNav = document.querySelector('.main-nav');

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    mainNav.classList.toggle('nav-open');
    toggleBtn.classList.toggle('is-active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !mainNav.contains(e.target) && mainNav.classList.contains('nav-open')) {
      mainNav.classList.remove('nav-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.classList.remove('is-active');
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('nav-open')) {
      mainNav.classList.remove('nav-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.classList.remove('is-active');
    }
  });
}

/**
 * Shop Interaction & Cart Floating Pill
 * Increments item counter and displays a non-intrusive feedback toast.
 */
let cartItemCount = 0;

function setupShopCart() {
  const addButtons = document.querySelectorAll('.add-btn, .shop-editorial-grid .add-btn');
  
  // Create or select floating cart counter indicator
  let cartBadge = document.querySelector('.cart-floating-indicator');
  
  addButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Find product name safely
      const card = button.closest('.product-card-rich');
      let productName = 'Product';
      if (card) {
        const titleEl = card.querySelector('h4');
        if (titleEl) productName = titleEl.textContent;
      }

      cartItemCount += 1;
      
      // Update badge if exists, or show toast
      showNotification(`Added "${productName}" to your cart! (${cartItemCount} item${cartItemCount > 1 ? 's' : ''})`, 'success');

      // Visual button feedback animation
      button.style.transform = 'scale(1.25)';
      setTimeout(() => {
        button.style.transform = '';
      }, 200);
    });
  });
}

/**
 * Search and Category Filter for Caregiver Directory (contacts.html)
 */
function setupDirectorySearch() {
  const searchInput = document.querySelector('.search-box input');
  const searchBtn = document.querySelector('.search-box button');
  const cards = document.querySelectorAll('.cards .card');
  const categoryItems = document.querySelectorAll('.category');

  if (!searchInput || cards.length === 0) return;

  function performFilter(queryText) {
    const term = queryText.toLowerCase().trim();

    cards.forEach((card) => {
      const title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
      const location = card.querySelector('.location') ? card.querySelector('.location').textContent.toLowerCase() : '';
      const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase()).join(' ');

      const matches = !term || title.includes(term) || location.includes(term) || tags.includes(term);

      if (matches) {
        card.style.display = 'block';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });

    // Check if any card is visible, if not show empty message
    let visibleCount = 0;
    cards.forEach(c => { if (c.style.display !== 'none') visibleCount++; });

    let noResultsEl = document.getElementById('search-empty-msg');
    const container = document.querySelector('.cards');

    if (visibleCount === 0) {
      if (!noResultsEl && container) {
        noResultsEl = document.createElement('div');
        noResultsEl.id = 'search-empty-msg';
        noResultsEl.className = 'empty-search-state';
        noResultsEl.textContent = `No caregivers found matching "${term}". Try another search!`;
        container.parentElement.appendChild(noResultsEl);
      }
    } else if (noResultsEl) {
      noResultsEl.remove();
    }
  }

  // Live filtering on keystroke
  searchInput.addEventListener('input', () => {
    performFilter(searchInput.value);
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performFilter(searchInput.value);
    });
  }

  // Category quick filter
  categoryItems.forEach((cat) => {
    cat.addEventListener('click', () => {
      const categoryName = cat.querySelector('h3') ? cat.querySelector('h3').textContent.trim() : '';
      searchInput.value = categoryName;
      performFilter(categoryName);
      
      // Smooth scroll down to caregivers section
      const targetSection = document.querySelector('.cards');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Toast Notification Utility
 * Safely creates an alert toast and cleans it up after 3.5 seconds.
 */
function showNotification(message, type = 'info') {
  let container = document.getElementById('pawgo-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pawgo-toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `pawgo-toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Fade out and remove
  setTimeout(() => {
    toast.classList.add('toast-fading');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 400);
  }, 3500);
}

/**
 * Highlight Active Link in Navigation
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.main-nav a, .nav-links a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop().split('#')[0];

    if (linkPath && (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html'))) {
      link.classList.add('active');
    }
  });
}

