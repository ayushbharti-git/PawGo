# PAWGO / PET CARE LANDING PAGE
## Pixel-Perfect HTML + CSS Build Specification for Antigravity 3.1 Pro

> **SOURCE OF TRUTH:** The attached PNG reference image is the visual source of truth for this task.
>
> **PRIMARY GOAL:** Recreate the reference page as closely as possible in structure, spacing, proportions, typography, colors, borders, shadows, image treatment, cards, buttons, footer, and overall visual rhythm.
>
> **TECH STACK LOCK:** HTML5 + CSS3 ONLY.
>
> **JAVASCRIPT IS NOT ALLOWED.**
>
> This file is also a **context-retention / anti-context-rot contract**. Before making the first implementation, and before making ANY future modification to this website, read this entire file again. Do not casually redesign, refactor, simplify, or reinterpret established visual decisions.

---



# 0. CRITICAL REFERENCE-ASSET INSTRUCTION — ANALYZE THE PNG IN THE PROJECT FOLDER

The user will place the reference PNG image in the project/folder alongside this markdown file.

**The PNG itself is a mandatory design reference and must be inspected before implementation.**

Do NOT rely only on the written description in this markdown file.

Before writing or changing any HTML/CSS:

1. Locate the reference PNG in the project folder.
2. Open/analyze the PNG visually.
3. Treat the PNG as the **primary visual source of truth**.
4. Use this markdown file as the implementation rules and context-retention contract.
5. Compare the rendered website against the PNG during implementation.
6. Re-analyze the PNG whenever a future change could affect visual fidelity.

### What the agent must extract from the PNG

Analyze the actual image for:

- exact section order
- approximate section heights
- container width and horizontal margins
- column proportions
- card dimensions
- gaps between cards
- vertical spacing between sections
- typography scale
- heading line breaks
- font weight and apparent font family
- line heights
- letter spacing
- text alignment
- background colors
- accent colors
- border colors
- border radii
- shadow softness
- button dimensions
- icon size and placement
- image dimensions
- image crop and focal points
- image/card overlap
- badges
- dividers
- footer density
- CTA composition
- responsive clues visible from the supplied reference

### Do not "improve" the screenshot

Do not substitute the reference's visual decisions with personal design preferences.

For example:

- If the screenshot has a large amount of whitespace, preserve it.
- If a card is small, do not enlarge it merely to make it easier to code.
- If typography looks compact, do not inflate it.
- If an image is offset, preserve the offset.
- If a section is visually sparse, keep it sparse.
- If the screenshot has subtle shadows, keep them subtle.

### Reference image priority rule

When this markdown and the PNG appear to conflict:

**Use the PNG for visual appearance and this markdown for technical constraints, architecture, animation rules, and future-edit context.**

The PNG is the authority for what the page should LOOK like.

This means the agent must not create a page that merely contains the same text and sections. It must recreate the **visual composition** of the PNG.

### Mandatory visual comparison loop

After the first implementation:

1. Render the website at a desktop viewport.
2. Compare the rendered result to the PNG.
3. Identify the largest visual mismatches.
4. Fix those mismatches.
5. Render again.
6. Repeat until geometry, spacing, typography, colors, cards, images, and overall composition are closely aligned.

Do the same for responsive breakpoints where practical.

**Do not declare completion simply because every section exists.**

The objective is visual reproduction.




---

# 0. REFERENCE ASSET REQUIREMENT — `image.png`

The project folder will contain the reference screenshot as:

```text
image.png
```

The agent MUST locate and inspect `image.png` directly before implementing the website.

Do NOT rely only on the written instructions in this markdown file.

## Required reference-analysis procedure

Before writing or changing HTML/CSS:

1. Locate `image.png` in the project folder.
2. Open and visually inspect the complete image.
3. Analyze the image at both the whole-page level and section-by-section level.
4. Use the actual image dimensions/aspect ratio to understand the original composition.
5. Identify the exact approximate positions of:
   - section boundaries
   - containers
   - columns
   - cards
   - buttons
   - images
   - badges
   - dividers
   - footer elements
6. Sample/estimate the dominant colors directly from the image where practical.
7. Study typography visually:
   - relative font sizes
   - weights
   - line heights
   - letter spacing
   - capitalization
   - line breaks
8. Study spacing visually:
   - page gutters
   - section padding
   - card gaps
   - internal card padding
   - heading-to-paragraph spacing
   - paragraph-to-button spacing
9. Study image composition:
   - crop
   - aspect ratio
   - overlap
   - corner radius
   - object position
10. Compare the implementation against `image.png` after the first render and during subsequent refinement.

## `image.png` has priority

Use this priority order:

```text
image.png
    ↓
this markdown specification
    ↓
reasonable implementation judgment
```

When the written specification and the screenshot differ, visually reproduce the screenshot unless the user explicitly requests otherwise.

Do not invent visual details merely because they sound appropriate for a pet-care website.

## Do not assume the screenshot's dimensions

Do NOT redesign the page based on a guessed viewport size.

Instead:

- inspect the actual `image.png`
- infer the screenshot's viewport and scaling
- preserve the relationships and proportions visible in the image
- reproduce the same visual hierarchy at desktop size
- then create sensible responsive behavior for smaller viewports

## Reference comparison requirement

After implementation, perform a visual comparison against `image.png`.

Check at minimum:

- overall silhouette of the page
- section heights
- left/right content alignment
- hero composition
- image/card proportions
- heading line breaks
- whitespace
- button dimensions
- card density
- footer proportions
- background transitions

Iterate until the rendered website is visually close to the reference.

The agent MUST NOT say that the page is "pixel perfect" merely because all sections exist. Pixel accuracy requires comparing the rendered result with `image.png`.

# 1. NON-NEGOTIABLE BUILD RULES

## 1.1 Technology

Use only:

- Semantic HTML5
- Modern CSS3
- CSS custom properties
- CSS Grid
- CSS Flexbox
- CSS transitions
- CSS keyframe animations
- CSS pseudo-elements
- CSS media queries
- Inline SVG markup only when an icon is needed and it is still embedded directly in HTML
- Standard web fonts or a properly loaded font using CSS `@import` / `<link>` only if required

Do NOT use:

- JavaScript
- React
- Next.js
- Vue
- Angular
- Tailwind
- Bootstrap
- Material UI
- component libraries
- animation libraries
- GSAP
- Framer Motion
- jQuery
- WebGL
- canvas
- build-tool-specific components
- script-based icon libraries
- generated framework boilerplate

The final page must work as a normal static HTML/CSS website.

---

# 2. CORE OBJECTIVE

Create a highly polished pet-care ecommerce/service landing page matching the attached PNG.

The page should visually communicate:

- warm premium pet-care brand
- trustworthy veterinary/pet-care service
- modern ecommerce experience
- soft off-white backgrounds
- dark charcoal typography
- muted sage/green secondary color
- coral/orange accent color
- rounded cards
- subtle shadows
- generous whitespace
- editorial-style photography
- premium but approachable aesthetic

The result must NOT look like a generic AI-generated pet website.

It must look like a deliberate production design that has been carefully recreated from the reference image.

---

# 3. REFERENCE IMAGE ANALYSIS

The reference image is a tall landing page containing the following major sections in this order:

1. Header / Hero
2. Care services
3. Featured PawGo Shop
4. Three steps / onboarding
5. Trust / safety section
6. Customer testimonials
7. PawGo Club CTA
8. Footer

The design uses a restrained visual system:

### Main background families

- warm ivory / cream
- nearly white
- very light beige
- pale warm gray
- muted sage green
- deep charcoal text
- coral/orange highlight

### General shape language

- rounded rectangles
- soft corners
- subtle 1px borders
- tiny rounded tags / badges
- restrained shadows
- compact icons in rounded square containers
- cards with generous internal padding
- pill-shaped buttons

Avoid sharp, aggressive, futuristic, neon, glassmorphism, excessive gradients, or dark-mode styling.

---

# 4. OVERALL LAYOUT SYSTEM

Build the page with a single central content container.

Recommended desktop baseline:

- max-width: approximately `1180px–1240px`
- page horizontal padding: approximately `28px–44px`
- centered content
- fluid width between desktop and tablet
- mobile width with `18px–22px` side padding

Do not allow text or cards to touch the viewport edges.

The reference relies heavily on whitespace. Do not compress sections simply to make the page shorter.

Use a consistent vertical rhythm.

Suggested system:

```css
--page-max: 1200px;
--page-gutter: 32px;
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-xl: 28px;
--text: #252321;
--muted-text: #77716b;
--coral: #ff6b4a;
--coral-dark: #f15a3f;
--sage: #6f887a;
--sage-light: #edf3ef;
--cream: #f7f3ec;
--warm-white: #fcfbf8;
--line: #ebe6df;
```

These values are starting points only. The screenshot remains the final visual authority.

---

# 5. TYPOGRAPHY

The reference has a modern rounded geometric / friendly sans-serif appearance.

Use a contemporary sans-serif with:

- strong bold display weight
- medium semibold section headings
- clean regular body copy
- compact uppercase eyebrow labels

Hierarchy:

### Hero headline
Very large, heavy, compact, approximately 2–3 lines on desktop.

The phrase:

> Everything Your Pet  
> Needs, **All in One**  
> **Place.**

Use coral/orange only for the highlighted words.

Do not make the whole headline orange.

### Section headings

Examples from the reference:

- `Care You Can Count On`
- `Featured in the PawGo Shop`
- `Three Steps to Flawless Care`
- `Designed for Your Peace of Mind`
- `Loved by Pets, Trusted by Owners`

Use bold typography with selective coral emphasis.

### Eyebrow labels

Tiny uppercase or small-caps style.

Use muted sage / green-gray.

Example:

`TAILORED SERVICES`

### Body copy

Short, compact, muted gray-beige text.

The reference uses relatively small body text. Do not make paragraph text oversized.

---

# 6. HEADER / HERO

## 6.1 Hero composition

The top section consists of:

### Left column

- small pill / eyebrow above headline
- large headline
- short descriptive paragraph
- two CTA buttons
- small trust/stat row below

### Right column

A visually overlapping pet-image composition with:

- large dog card
- smaller cat card
- rounded white card containers
- subtle offset/overlap
- miniature metadata inside or near the cards

The visual relationship between the cards is important.

Do not turn this into a normal two-column image grid.

It should feel layered and editorial.

---

## 6.2 Hero image cards

Large dog image:

- dominant image
- rounded corners
- white surrounding card
- image cropped naturally
- subtle shadow
- tiny lower metadata area

Cat image:

- smaller card
- offset upward/right
- rounded corners
- distinct image crop
- subtle shadow

The composition should resemble a floating collage rather than two equal cards.

---

## 6.3 Hero buttons

Primary button:

- coral/orange fill
- white text
- rounded pill
- compact height
- small arrow icon
- subtle hover movement

Secondary button:

- white/light background
- thin border
- dark text
- same approximate dimensions

Keep the buttons visually compact.

Do not create huge dashboard-style buttons.

---

## 6.4 Hero statistics

Two or more small stats under the buttons.

Example concepts visible in the reference:

- 45k+
- 99.4%

Use:

- bold number
- tiny descriptive uppercase/compact text
- horizontal layout
- subtle spacing

These should feel like quiet credibility markers, not giant statistics.

---

# 7. CARE SERVICES SECTION

Background changes to a warmer beige/cream.

Centered section intro:

- eyebrow
- heading
- short centered paragraph

Then four service cards.

Cards:

1. Dog Walking
2. Vet Clinics
3. Pet Grooming
4. Pet Sitting

Each card contains:

- small icon box
- title
- two-line description
- subtle divider
- lower pricing text
- circular/orange arrow affordance

## Card styling

- white/off-white surface
- rounded corners
- thin warm border
- subtle shadow
- generous but compact padding
- equal visual height
- equal widths on desktop

The cards should appear clean and light rather than heavy.

---

# 8. FEATURED PAWGO SHOP

Return to a lighter section background.

Top row contains:

### Left

- eyebrow
- title
- subtitle

### Right

Small text link:

`View All 240+ Products`

with a subtle arrow.

Then show four product cards:

1. Premium Organic Kibble
2. Plush Squeaky Duck Toy
3. Classic Nylon Leather Collar
4. Orthopedic Memory Bed

Each card contains:

- product image area
- small category / product badge
- product title
- rating / review metadata
- price
- optional crossed-out old price
- circular orange add/action button

The cards should feel like an ecommerce shelf.

Use a consistent product image height.

Do not let product images change the card height.

---

# 9. THREE STEPS SECTION

Use a soft warm section background.

Centered heading:

`Three Steps to Flawless Care`

Add a small explanatory sentence.

Then three horizontal cards:

### 01
Create Pet Profile

### 02
Choose Your Service

### 03
Enjoy Peace of Mind

Each card:

- large faint step number
- small icon
- title
- compact paragraph

The large number must be subtle and decorative, not dominant.

Use a balanced three-column layout.

---

# 10. TRUST / SAFETY SECTION

This is one of the strongest visual sections.

Use a two-column layout:

### Left

Large lifestyle image:

- person walking a dog in a park
- rounded corners
- wide rectangular crop
- photographic and warm

Add a small overlay badge near the lower area.

### Right

Eyebrow:

`SAFETY & COMFORT`

Headline:

`Designed for Your Peace of Mind`

Coral accent should highlight the phrase:

`Your Peace of Mind`

Then a short paragraph and three feature rows.

Suggested feature labels:

- Certified Pet Handlers
- 24/7 Veterinary Hotline
- Tailored Pet Profiles

Each row:

- small icon
- bold heading
- very small supporting text

Keep the content vertically aligned and balanced against the image.

---

# 11. TESTIMONIALS

Use another soft warm section.

Centered heading:

`Loved by Pets, Trusted by Owners`

Support text beneath.

Then three testimonial cards.

Each card:

- rating stars at top
- quote
- small avatar
- person name
- short identifier/location or context

Cards should have:

- rounded corners
- white surface
- thin border
- subtle shadow
- comfortable internal padding

Do not make quotes oversized.

The typography should remain compact and elegant.

---

# 12. PAWGO CLUB CTA

Use a wide rounded dark-sage/green promotional card.

Approximate composition:

### Left side

- heading:
  `Join the PawGo Club Today & Get 20% Off`
- supporting text
- email input
- coral CTA button

### Right side

Large rounded pet image.

The CTA card should feel premium and substantial.

Use:

- dark muted green background
- white text
- coral/orange button
- rounded outer container
- large internal padding

The image should be visually integrated into the card rather than sitting as a separate normal image.

---

# 13. FOOTER

Footer background returns to a very light warm neutral.

Layout:

### Left

PawGo logo / brand mark

Short company description.

Social icons underneath.

### Middle columns

Services

- Dog Walking
- Vet Clinics
- Pet Grooming
- Pet Sitting
- etc.

PawGo Shop

- Dog & Food
- Health
- Organic Toys
- Collars & Leashes
- etc.

Company

- About Us
- Our Pet Promise
- Careers at PawGo
- Press
- Contact Us

Then bottom divider.

Bottom row:

- copyright
- Privacy Policy
- Terms of Service
- Pet Safety / accessibility-style links

Keep the footer understated.

Do not over-design it.

---

# 14. RESPONSIVE BEHAVIOR

The reference is visually desktop-oriented, but the implementation must still behave properly on smaller screens.

## Desktop

- hero: two columns
- services: four columns
- products: four columns
- steps: three columns
- trust: two columns
- reviews: three columns
- CTA: two columns
- footer: multi-column

## Tablet

Reduce gaps and typography slightly.

Service/product cards may become 2x2.

Reviews may become 2+1.

Hero image composition should remain visually layered.

## Mobile

Use a single column where necessary.

Important:

Do NOT simply squash desktop into mobile.

Instead:

- hero text first
- hero image collage second
- cards stack
- images retain aspect ratio
- buttons may become full-width or neatly wrap
- footer columns stack
- CTA image can move below text

Maintain generous spacing.

---

# 15. ANIMATION SYSTEM

Animations are required, but they must be elegant.

Do NOT turn the site into an animated theme park.

Use CSS only.

## Allowed animation categories

### Page load

Use subtle fade + upward movement for:

- hero eyebrow
- hero heading
- hero paragraph
- buttons
- hero cards

Stagger them with CSS animation delays.

### Floating imagery

The hero pet cards can use a very subtle floating animation:

- 4–8px movement
- slow 5–8 second cycle
- ease-in-out
- extremely subtle rotation if desired

### Card hover

On hover:

- translateY(-3px to -6px)
- slightly stronger shadow
- image scale around 1.02–1.04
- arrow nudges a few pixels

Keep this restrained.

### Buttons

On hover:

- subtle upward movement
- slight shadow change
- arrow movement

### Product image hover

Very subtle zoom.

Never zoom so much that the product leaves the crop.

### Section reveal

Prefer modern CSS scroll-driven animation where browser support permits.

Fallback should be a static visible layout.

Do not use JavaScript intersection observers.

### CTA motion

The CTA image can have a very subtle slow scale or parallax-like feeling using CSS animation only.

---

# 16. MICRO-INTERACTIONS

Use subtle visual responses for:

- buttons
- service arrows
- product action buttons
- footer links
- navigation links
- testimonial cards
- product cards

Do not animate:

- huge font-size changes
- layout widths
- text wrapping
- entire page background
- aggressive rotations
- flashing elements
- bouncing cards

---

# 17. IMAGES

The reference image contains multiple photographic pet images.

Image treatment is important:

- warm natural photography
- dogs and cats
- realistic photography
- editorial ecommerce feel
- no cartoon images
- no AI-looking images
- no illustrations unless explicitly required by the reference

Use appropriate image URLs or local image assets available to the project.

When exact reference assets are unavailable:

1. choose visually similar photography
2. match subject placement
3. match dominant colors
4. match crop
5. match aspect ratio

Do NOT choose random unrelated images merely to fill space.

---

# 18. ICONS

Use simple thin-line icons.

Icon style should be:

- small
- rounded
- minimal
- professional
- consistent stroke weight

Avoid:

- emoji
- oversized illustrations
- colorful icon packs
- cartoon iconography

Inline SVG icons in HTML are permitted.

---

# 19. BORDERS + SHADOWS

Shadows are subtle.

Preferred visual formula:

```css
box-shadow:
  0 4px 12px rgba(30, 26, 20, 0.04),
  0 1px 3px rgba(30, 26, 20, 0.04);
```

Do not use giant dark shadows.

Borders should mostly be:

- 1px
- very low contrast
- warm gray / cream

---

# 20. SECTION SPACING

A major part of matching the reference is vertical rhythm.

Use large top/bottom section padding.

Approximate visual behavior:

- hero: large vertical breathing room
- services: medium-large spacing
- shop: medium-large spacing
- steps: medium-large spacing
- trust: large two-column breathing room
- testimonials: medium-large spacing
- CTA: compact but spacious
- footer: medium padding

Never let sections feel cramped.

---

# 21. VISUAL PRECISION CHECKLIST

After the first implementation, compare the page against the reference image and adjust:

### Geometry
- container width
- section height
- horizontal alignment
- vertical spacing
- card width
- card height
- border radius
- image crop

### Typography
- font family
- heading size
- font weight
- line height
- letter spacing
- text width
- paragraph width

### Colors
- background shades
- coral accent
- sage accent
- text charcoal
- border color

### Components
- button dimensions
- badges
- icon containers
- pricing rows
- review layouts
- footer columns

### Composition
- hero image offset
- trust image/text balance
- CTA image placement
- footer density

---

# 22. PIXEL-PERFECT WORKFLOW

The implementation process MUST follow this workflow.

## Phase 1 — Inspect

Before writing code:

1. Inspect the reference PNG.
2. Identify every visible section.
3. Identify repeated components.
4. Estimate section boundaries.
5. Identify typography hierarchy.
6. Identify colors.
7. Identify card dimensions and spacing.
8. Identify image aspect ratios.
9. Identify responsive assumptions.

Do not immediately start coding from generic assumptions.

## Phase 2 — Build structure

Create semantic HTML for all sections first.

Do not overcomplicate the DOM.

Use reusable class conventions.

Recommended high-level structure:

```html
<body>
  <header class="site-header">...</header>

  <main>
    <section class="hero">...</section>
    <section class="services">...</section>
    <section class="shop">...</section>
    <section class="steps">...</section>
    <section class="trust">...</section>
    <section class="testimonials">...</section>
    <section class="club-cta">...</section>
  </main>

  <footer class="site-footer">...</footer>
</body>
```

## Phase 3 — Styling

Build the design system first:

- CSS variables
- typography
- container
- spacing
- buttons
- cards
- badges
- common shadows
- common radii

Then section-specific styles.

## Phase 4 — Animation

Add motion only after static geometry is accurate.

Static visual correctness has priority over animation.

## Phase 5 — Comparison

Render the page.

Compare it directly against the supplied PNG.

Look for differences in:

- section heights
- text placement
- card dimensions
- whitespace
- image crops
- visual density

Then iterate.

---

# 23. DO NOT OVER-ENGINEER

This is a static landing page.

Prefer:

```html
<div class="card">
```

over unnecessary abstraction.

Prefer:

```css
.services-grid {
  display: grid;
}
```

over complex utility systems.

Keep the code understandable.

The website should be easy for another developer or coding agent to modify later.

---

# 24. CONTEXT RETENTION / FUTURE EDIT RULE

THIS SECTION IS MANDATORY.

Before modifying any existing file in future sessions:

1. Read this markdown file.
2. Inspect the current HTML and CSS.
3. Preserve the established visual system.
4. Preserve existing section order unless the user explicitly requests a change.
5. Preserve established spacing unless the user explicitly requests a change.
6. Preserve colors unless the user explicitly requests a change.
7. Preserve typography unless the user explicitly requests a change.
8. Preserve responsive behavior.
9. Preserve existing animations unless the user explicitly requests their removal/change.
10. Make the smallest change necessary to satisfy the new request.

Never assume that a future request means the entire design should be rewritten.

---

# 25. CHANGE SAFETY RULE

When a future change is requested:

### First classify it

Is it:

- content-only?
- spacing-only?
- typography-only?
- color-only?
- component-only?
- animation-only?
- layout-only?
- responsive-only?
- structural?

Then modify only the relevant CSS/HTML.

Do not accidentally change unrelated sections.

---

# 26. DO NOT LOSE CONTEXT


### Future-change reference rule

For every future visual change, the agent must inspect both:

- the current website implementation
- `image.png`

Do not allow the current implementation to become the only source of truth, because incremental changes can cause visual drift from the original reference.


Never:

- redesign the entire page because one card changed
- replace all CSS because one section needs adjustment
- introduce JavaScript to solve a CSS problem
- replace the existing visual language with a trendy style
- remove whitespace to "fit more content"
- change the color palette without permission
- flatten the card hierarchy
- convert the page into a generic SaaS layout
- convert the page into a dashboard
- introduce unnecessary gradients
- introduce neon colors
- introduce glassmorphism
- introduce excessive blur
- introduce huge animated effects

The page is intentionally minimal, warm, editorial, and premium.

---

# 27. ACCESSIBILITY

Maintain:

- semantic headings
- meaningful button text
- alt text for images
- sufficient contrast
- keyboard-visible focus states
- reduced-motion support

Add:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# 28. PERFORMANCE RULES

Because this is an image-heavy landing page:

- use `loading="lazy"` for below-the-fold images
- use `decoding="async"`
- use sensible image dimensions
- avoid enormous source images where possible
- avoid CSS animation on expensive layout properties
- animate `transform` and `opacity`
- avoid excessive box-shadow animation
- avoid unnecessary DOM nesting

Do not sacrifice visual fidelity unnecessarily.

---

# 29. ACCEPTANCE CRITERIA

The implementation is considered complete only when:

- the entire page exists
- section order matches the reference
- typography hierarchy resembles the reference
- hero composition resembles the reference
- cards resemble the reference
- colors are visually close
- spacing is visually close
- CTA resembles the reference
- footer resembles the reference
- animations are subtle and polished
- no JavaScript exists
- no framework exists
- no animation library exists
- no generic template look remains
- responsive behavior is clean
- accessibility basics are present

---

# 30. FINAL PRIORITY ORDER

When trade-offs are necessary, prioritize:

1. **Reference-image visual fidelity**
2. Layout geometry
3. Typography
4. Spacing / whitespace
5. Colors
6. Image composition
7. Component details
8. Animation polish
9. Code elegance

Do NOT sacrifice reference fidelity just to make the implementation more "creative."

The task is recreation, not redesign.

---

# NEGATIVE PROMPT / THINGS THE AGENT MUST NOT DO

## NEVER DO THESE

### Technology
- NO JavaScript
- NO React
- NO Tailwind
- NO Bootstrap
- NO GSAP
- NO animation frameworks
- NO component libraries
- NO JS-based sliders
- NO JS-based scroll reveal
- NO canvas
- NO WebGL

### Visual style
- NO neon
- NO cyberpunk
- NO futuristic UI
- NO glassmorphism
- NO excessive gradients
- NO glossy UI
- NO metallic UI
- NO black/dark website theme
- NO oversized rounded blobs
- NO excessive decorative shapes
- NO cartoon pet illustrations
- NO childish kindergarten-style graphics
- NO generic AI-generated landing-page aesthetic

### Layout
- NO dashboard layout
- NO excessive full-width cards
- NO giant hero image taking the entire screen
- NO giant navigation bar
- NO huge buttons
- NO cramped sections
- NO excessive columns
- NO arbitrary asymmetry that is not present in the reference
- NO inconsistent card sizes

### Typography
- NO oversized body text
- NO ultra-thin body text
- NO decorative serif unless the reference clearly requires it
- NO random font switching
- NO extreme letter spacing
- NO all-caps paragraphs

### Animation
- NO bouncing
- NO shaking
- NO flashing
- NO continuous aggressive rotation
- NO rapid parallax
- NO animated gradients
- NO excessive floating
- NO animation that changes layout geometry
- NO distracting entrance effects

### Images
- NO unrelated stock photography
- NO low-quality pet images
- NO cartoon pet graphics
- NO badly cropped images
- NO mismatched aspect ratios
- NO image stretching

### Code
- NO giant monolithic CSS file if clean section organization is practical
- NO duplicated CSS for identical components
- NO inline style spam
- NO unnecessary dependencies
- NO unnecessary wrappers
- NO broken links
- NO placeholder text such as Lorem Ipsum
- NO unexplained temporary hacks left in production

---

# 31. IMPORTANT AGENT BEHAVIOR

The agent should behave like a **pixel-accurate frontend reconstruction specialist**, not like a visual designer inventing a new website.

The attached PNG is the authority.

When uncertain between:

- "what looks trendy"
- "what the screenshot shows"

choose **what the screenshot shows**.

When uncertain between:

- "simpler implementation"
- "closer visual reproduction"

choose **closer visual reproduction**, as long as the implementation remains HTML + CSS only.

Before every future edit:

> READ THIS FILE FIRST.

After every future edit:

> VERIFY THAT THE CHANGE DID NOT BREAK THE ESTABLISHED VISUAL SYSTEM.

---

# 32. FINAL INSTRUCTION

Build the complete website from the attached PNG reference.

Do not stop after creating a hero section.

Implement the full page from top to bottom, including:

- Hero
- Services
- Shop
- Three Steps
- Trust/Safety
- Testimonials
- PawGo Club CTA
- Footer

Use HTML and CSS only.

Add tasteful CSS animations.

Keep the visual language extremely close to the reference.

Treat this markdown file as the permanent design/context contract for this project.

**READ THIS FILE BEFORE EVERY FUTURE CHANGE.**
