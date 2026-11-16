/**
 * ==============================================================================
 * Express APIs: External API Integration (routes/externalRoutes.js)
 * ==============================================================================
 * Requirement 1: Fetching and showing data via External APIs calls.
 * 
 * Public APIs integrated:
 *   1. Dog CEO API (https://dog.ceo/api/breeds/image/random) - Random Breed Image
 *   2. Cat Fact Ninja API (https://catfact.ninja/fact) - Real-time animal fact
 *   3. Built-in resilient fallbacks so the app works reliably even offline.
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();

// Curated offline fallbacks
const FALLBACK_FACTS = [
  "Dogs' sense of smell is about 10,000 to 100,000 times more acute than humans.",
  "Cats sleep for 12 to 16 hours a day to conserve energy for play and focus.",
  "A dog’s nose print is unique, much like human fingerprints.",
  "Regular brisk walks lower canine stress hormones and prevent joint stiffness.",
  "Cats communicate with humans through meows; they rarely meow at other adult cats."
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1543466835011-89d424b917fc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80"
];

// GET /api/external/dog-image - Fetch random pet image from Dog CEO External API
router.get('/dog-image', async (req, res) => {
  const dogApiUrl = process.env.DOG_API_URL || 'https://dog.ceo/api/breeds/image/random';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const apiRes = await fetch(dogApiUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (apiRes.ok) {
      const data = await apiRes.json();
      // Extract breed name from Dog CEO URL (e.g., https://images.dog.ceo/breeds/retriever-golden/...)
      const match = data.message ? data.message.match(/breeds\/([^/]+)/) : null;
      const breed = match ? match[1].replace('-', ' ').toUpperCase() : 'CANINE COMPANION';

      return res.json({
        success: true,
        source: 'Dog CEO External API',
        url: dogApiUrl,
        imageUrl: data.message,
        breed
      });
    }
    throw new Error(`API returned HTTP ${apiRes.status}`);
  } catch (err) {
    // Graceful offline fallback
    const fallbackImage = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
    return res.json({
      success: true,
      source: 'Curated PawGo Archive (Offline Fallback)',
      notice: 'External API currently unreachable or timed out; served offline cache.',
      imageUrl: fallbackImage,
      breed: 'GOLDEN RETRIEVER'
    });
  }
});

// GET /api/external/pet-facts - Fetch pet fact from Cat Fact / Dog Fact External API
router.get('/pet-facts', async (req, res) => {
  const catFactUrl = process.env.CAT_FACTS_API_URL || 'https://catfact.ninja/fact';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const apiRes = await fetch(catFactUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (apiRes.ok) {
      const data = await apiRes.json();
      return res.json({
        success: true,
        source: 'Cat Facts External API',
        url: catFactUrl,
        fact: data.fact,
        length: data.length
      });
    }
    throw new Error(`API returned HTTP ${apiRes.status}`);
  } catch (err) {
    const randomFact = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
    return res.json({
      success: true,
      source: 'PawGo Veterinary Science Archive (Offline Fallback)',
      notice: 'External API currently unreachable; served offline animal wellness fact.',
      fact: randomFact,
      length: randomFact.length
    });
  }
});

// GET /api/external/discovery - Combined discovery card (Image + Fact + Care recommendation)
router.get('/discovery', async (req, res) => {
  try {
    // Fetch both external APIs concurrently using Promise.allSettled
    const [imgResult, factResult] = await Promise.allSettled([
      fetch(process.env.DOG_API_URL || 'https://dog.ceo/api/breeds/image/random').then(r => r.json()),
      fetch(process.env.CAT_FACTS_API_URL || 'https://catfact.ninja/fact').then(r => r.json())
    ]);

    const imageUrl =
      imgResult.status === 'fulfilled' && imgResult.value.message
        ? imgResult.value.message
        : FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

    const fact =
      factResult.status === 'fulfilled' && factResult.value.fact
        ? factResult.value.fact
        : FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      discovery: {
        imageUrl,
        fact,
        tip: 'Ensure your companion has continuous access to fresh water and 30-45 minutes of physical engagement daily.'
      }
    });
  } catch (err) {
    res.json({
      success: true,
      discovery: {
        imageUrl: FALLBACK_IMAGES[0],
        fact: FALLBACK_FACTS[0],
        tip: 'Consistent routines promote emotional security in companion pets.'
      }
    });
  }
});

module.exports = router;

