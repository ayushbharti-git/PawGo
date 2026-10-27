# 🐾 PawGo — Premium Pet Care Ecosystem
### Web Development Project — 2nd Evaluation Implementation

---

## 📖 1. Project Overview & Purpose
**PawGo** is a comprehensive pet care ecosystem web application designed to connect pet parents with trusted, vetted pet care services. It integrates five core verticals:
1. **🐕 Dog Walking**: Active lifestyle, GPS-tracked exercise, and reliable volunteer/pro walkers.
2. **✂️ Spa & Grooming**: Low-stress coat care, hygiene, and soothing baths.
3. **🩺 Veterinary Network**: Routine examinations, vaccination reminders, and 24/7 tele-triage.
4. **🏡 Boarding & Pet Sitting**: Safe home stays, playtime, and overnight supervision.
5. **🥩 Nutrition & Shop**: Curated vet-approved foods, organic treats, and wellness supplements.

For the **2nd Evaluation**, this project has been extended from a static landing page into a fully connected, interactive multi-page web application featuring **client-side form validation**, **asynchronous AJAX/JSON submission**, and **persistent server-side storage in local JSON files** (`data/submissions.json`) powered by a lightweight Node.js backend.

---

## 🌐 2. Implemented Pages & Navigation Structure

All pages share a consistent, responsive header navigation, sticky booking CTA (`Book Pet Care →`), and footer with valid links.

| Page | File | Purpose |
| :--- | :--- | :--- |
| **Home** | [`index.html`](file:///c:/Users/Ayush/Desktop/pawgo/index.html) | Brand landing page featuring hero collage, trust statistics, service discovery, routine timeline, shop tabs, care team profiles, and club newsletter signup. |
| **Services** | [`services.html`](file:///c:/Users/Ayush/Desktop/pawgo/services.html) | Complete catalog of pet care services with descriptions, pricing badges, and direct booking links. |
| **Caregiver Directory** | [`contacts.html`](file:///c:/Users/Ayush/Desktop/pawgo/contacts.html) | "PawGo Connect" directory with real-time text search and category filtering for verified caregivers. |
| **About Us** | [`about.html`](file:///c:/Users/Ayush/Desktop/pawgo/about.html) | Ecosystem mission, background, and founding caregiver team profiles (Dr. Kabir, Ayush, Abhinav). |
| **Contact & Support** | [`contact.html`](file:///c:/Users/Ayush/Desktop/pawgo/contact.html) | Contact form for support inquiries, emergency hotline details, and an interactive FAQ accordion. |
| **Book Pet Care** | [`booking.html`](file:///c:/Users/Ayush/Desktop/pawgo/booking.html) | Primary appointment booking form with live price estimation and care requirements. |
| **Caregiver Registration** | [`provider.html`](file:///c:/Users/Ayush/Desktop/pawgo/provider.html) | Professional onboarding form for walkers, groomers, and vet assistants to join the PawGo network. |
| **Confirmation** | [`confirmation.html`](file:///c:/Users/Ayush/Desktop/pawgo/confirmation.html) | Digital submission receipt displaying unique reference ID, submission timestamp, and structured summary. |
| **Records Dashboard** | [`records.html`](file:///c:/Users/Ayush/Desktop/pawgo/records.html) | Submissions viewer that fetches stored JSON records, supports type filtering/search, and demonstrates record deletion with confirmation. |

---

## ⚡ 3. Main JavaScript Interactions

Implemented in vanilla JavaScript across modular scripts in `js/`:

- **Mobile Navigation Drawer** (`setupMobileNav` in [`js/main.js`](file:///c:/Users/Ayush/Desktop/pawgo/js/main.js)):
  - Hamburger toggle button (`.mobile-menu-btn`) dynamically opens/closes the menu drawer.
  - Updates `aria-expanded` and keyboard accessibility (closes on `Escape` key or click outside).
- **Interactive Shop Cart Badge** (`setupShopCart` in [`js/main.js`](file:///c:/Users/Ayush/Desktop/pawgo/js/main.js)):
  - Clicking `+` buttons on product cards increments the cart state and triggers temporary button animations.
  - Non-intrusive floating toast notifications (`showNotification`).
- **Live Directory Search & Filter** (`setupDirectorySearch` in [`js/main.js`](file:///c:/Users/Ayush/Desktop/pawgo/js/main.js)):
  - Live filtering of caregiver cards as the user types in the search input.
  - Category pill clicks automatically populate search queries and scroll to the cards section.
  - Dynamic empty state display when no caregivers match the search term.
- **Dynamic Price Estimator** (`updateEstimate` in [`js/forms.js`](file:///c:/Users/Ayush/Desktop/pawgo/js/forms.js)):
  - Calculates estimated appointment totals in real-time as the user switches services and pet types.
- **Interactive FAQ Accordion** ([`contact.html`](file:///c:/Users/Ayush/Desktop/pawgo/contact.html)):
  - Expand/collapse answers with rotating `+` indicators.
- **Records Dashboard Interactions** ([`js/records.js`](file:///c:/Users/Ayush/Desktop/pawgo/js/records.js)):
  - Asynchronous fetching from `GET /api/records`.
  - Type-based dropdown filtering and live text search across records.
  - Confirmation prompt (`window.confirm`) before executing destructive record deletions (`DELETE /api/records/:id`).
  - Safe DOM rendering via `document.createElement` and `textContent` (zero unsafe `innerHTML`).

---

## 📝 4. Forms & Validation Rules

### 1. Booking Form ([`booking.html`](file:///c:/Users/Ayush/Desktop/pawgo/booking.html))
- **Owner Name**: Required, trimmed, minimum 2 characters.
- **Email**: Required, validated against regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- **Phone Number**: Required, trimmed, minimum 7 digits.
- **Pet Name**: Required, minimum 2 characters.
- **Pet Species**: Required dropdown (`Dog`, `Cat`, `Other`).
- **Care Service**: Required dropdown (`Walking`, `Grooming`, `Veterinary`, `Sitting`, `Taxi`).
- **Date**: Required, validated to ensure appointment is not set in the past.
- **Time Slot**: Required dropdown selection.
- **Notes**: Optional special care instructions.

### 2. Contact & Inquiries Form ([`contact.html`](file:///c:/Users/Ayush/Desktop/pawgo/contact.html))
- **Name**: Required, minimum 2 characters.
- **Email**: Required, valid email format.
- **Inquiry Topic**: Required dropdown.
- **Message**: Required, trimmed, minimum 10 characters.

### 3. Provider Onboarding Form ([`provider.html`](file:///c:/Users/Ayush/Desktop/pawgo/provider.html))
- **Full Name, Email, Phone**: Required and validated.
- **Care Specialty**: Required dropdown.
- **Years of Experience**: Number input, non-negative integer.
- **Operating City**: Required text string.
- **Background & Bio**: Required, minimum 20 characters.
- **Agreement**: Mandatory checkbox confirming background check consent and safety standards.

### 4. Newsletter Subscription Form ([`index.html`](file:///c:/Users/Ayush/Desktop/pawgo/index.html))
- **Email**: Required, validated against standard email format.

### Submission UX Features:
- **Duplicate Prevention**: Buttons are disabled and display loading state (e.g. `Securing Booking...`) while requests are in flight.
- **Error Preservation**: If submission fails, user inputs remain intact in the form fields.
- **Inline Error Feedback**: Specific error text appears directly below invalid inputs with `role="alert"`.

---

## 💾 5. Backend & JSON Storage Workflow

### Data Flow Diagram:
```
[User Fills Form]
       │
       ▼
[Client-side Validation (forms.js)] ──(Invalid)──> [Show Inline Error Messages]
       │ (Valid)
       ▼
[JSON.stringify(payload)]
       │
       ▼
[fetch('/api/bookings', { method: 'POST' })]
       │
       ▼
[server.js: Server-Side Validation & Sanitization] ──(Invalid)──> [Return HTTP 400 Bad Request]
       │ (Valid)
       ▼
[Generate ID: "pwg_..." + ISO Timestamp]
       │
       ▼
[fs.promises.readFile('data/submissions.json')]
       │
       ▼
[Append New Record to Array without Overwriting]
       │
       ▼
[fs.promises.writeFile('data/submissions.json')]
       │
       ▼
[Return HTTP 201 Created { success: true, record }]
       │
       ▼
[Redirect to confirmation.html & Display Receipt]
```

### Storage Location:
All data is stored locally in the [`data/`](file:///c:/Users/Ayush/Desktop/pawgo/data/) directory:
- `data/submissions.json`: Master unified log containing all submissions.
- `data/bookings.json`: Dedicated pet care booking records.
- `data/contacts.json`: Inquiries and customer messages.
- `data/providers.json`: Caregiver applications.
- `data/newsletter.json`: Newsletter subscribers.

### Fault Tolerance & Safety:
- **Resilient JSON Parsing**: If a JSON file contains malformed data or is empty, `readJsonFile()` safely recovers with an empty array `[]` instead of crashing the server process.
- **Path Sanitization**: Filesystem paths are strictly hardcoded on the server; clients cannot inject arbitrary paths.

---

## 🛠️ 6. Required Software & Dependencies

- **Node.js**: v18.0.0 or newer (tested with v24.22.1).
- **Dependencies**:
  - `express`: Minimal HTTP server framework.
  - *Note*: `server.js` includes an **automatic native HTTP fallback**. If run without `npm install`, it automatically uses Node's built-in `http` module with zero external dependencies!

---

## 🚀 7. How to Install & Run the Project

### Step 1: Open Terminal in Project Directory
```powershell
cd C:\Users\Ayush\Desktop\pawgo
```

### Step 2: Install Dependencies (Optional)
```powershell
npm install
```
*(If npm install cannot be run, `server.js` will seamlessly run in native Node mode!)*

### Step 3: Start the Server
```powershell
node server.js
```
Expected output:
```text
=======================================================
🐾 PawGo Web Application Server running!
🌐 Local URL: http://localhost:3000
📁 JSON Data Directory: C:\Users\Ayush\Desktop\pawgo\data
=======================================================
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
**`http://localhost:3000`**

---

## 🧪 8. How to Test Form Submissions & Verification

### Manual Form Testing:
1. Go to `http://localhost:3000/booking.html`.
2. Try submitting with empty fields. Observe inline red validation error messages.
3. Fill in valid owner and pet details (e.g., Name: `Ayush`, Pet: `Bailey`, Date: `Tomorrow`).
4. Click **"Confirm & Book Pet Care"**.
5. Notice the button changes to `Securing Booking...` and disables.
6. The page redirects to `confirmation.html` displaying your unique ID (e.g. `pwg_m4k9...`) and submission details.
7. Open [`data/submissions.json`](file:///c:/Users/Ayush/Desktop/pawgo/data/submissions.json) in your code editor: see your new record safely appended!
8. Navigate to `http://localhost:3000/records.html` to view the stored record in the live dashboard.

### Automated Verification Suite:
An automated test suite is included in [`test-server.js`](file:///c:/Users/Ayush/Desktop/pawgo/test-server.js). Run:
```powershell
node test-server.js
```
Runs **64 automated checks** verifying:
- HTML existence, branding, and absence of dead links.
- Storage file creation and directory structure.
- Server-side validation rules and whitespace rejection.
- Unique ID and timestamp generation.
- Array append persistence across restarts.
- Corrupt JSON crash resilience.
- Record retrieval and deletion.

---

## ⚠️ 9. Known Limitations (Viva & Exam Discussion Points)

During a viva or practical examination, you can explain these design decisions:
1. **Local JSON File Concurrency**: For this educational single-user project, `fs.promises.writeFile` to a local `.json` file is simple and clear. In high-traffic multi-user production systems, concurrent writes can cause race conditions; production systems use relational databases (PostgreSQL/MySQL) or document stores (MongoDB) with ACID transactions and connection pooling.
2. **Client-Side vs Server-Side Validation**: While client-side validation provides instant visual feedback for the user, malicious clients can bypass browser checks (e.g. via cURL or Postman). Therefore, `server.js` independently validates all data fields.
3. **Data Privacy**: Stored records in `data/submissions.json` contain user-submitted contact info and should never be made publicly accessible without authentication in production environments.

