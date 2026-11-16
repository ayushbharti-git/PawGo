# 🐾 PawGo — Premium Pet Care Ecosystem
### Full-Stack Web Development Project: Node.js, Express, MongoDB & External APIs

---

## 📖 1. Project Overview & Architectural Summary
**PawGo** is a full-stack pet care ecosystem designed to connect pet parents with trusted pet care services (Dog Walking, Grooming, Veterinary Clinic, Boarding, and Nutrition).

The project features a **hybrid persistence and service layer** fulfilling all evaluation requirements:
1. **🌐 External APIs Integration**: Real-time fetching of animal wellness facts and random breed images from public REST APIs (Dog CEO API & Cat Fact Ninja API) with automatic resilient fallbacks.
2. **🚀 Node & Express Backend Architecture**: Robust modular server with `dotenv`, `cors`, structured routing, Mongoose database models, and error handling middleware.
3. **📁 Express APIs for Local JSON Storage**: Dedicated endpoints under `/api/json/*` to read, write, append, and delete records directly from filesystem `.json` files in `data/`.
4. **🍃 MongoDB Database CRUD Operations**: Complete Mongoose models and Express endpoints under `/api/mongo/*` supporting full Create, Read, Update (PUT & PATCH), and Delete lifecycle operations.

---

## 🏗️ 2. Project Directory Structure

```text
pawgo/
├── .env                  # Environment configuration (PORT, MONGODB_URI, external API URLs)
├── .env.example          # Environment variables template
├── config/
│   └── db.js             # Mongoose MongoDB connection & health status reporting
├── models/
│   ├── Booking.js        # Mongoose Schema & Model for Pet Appointments
│   ├── Contact.js        # Mongoose Schema & Model for Customer Inquiries
│   ├── Provider.js       # Mongoose Schema & Model for Caregiver Applications
│   └── Newsletter.js     # Mongoose Schema & Model for Newsletter Subscribers
├── routes/
│   ├── externalRoutes.js # Requirement 1: External Public API Endpoints
│   ├── jsonRoutes.js     # Requirement 3: Local JSON File Express APIs
│   └── mongoRoutes.js    # Requirement 4: MongoDB Database CRUD Express APIs
├── data/
│   ├── submissions.json  # Master unified JSON records file
│   ├── bookings.json     # Booking records JSON file
│   ├── contacts.json     # Contact inquiries JSON file
│   ├── providers.json    # Caregiver applications JSON file
│   └── newsletter.json   # Newsletter subscriptions JSON file
├── js/
│   ├── main.js           # UI interactions, mobile drawer, search filtering, cart badge
│   ├── forms.js          # Client-side validation & AJAX form submissions
│   └── records.js        # Dashboard controller (JSON vs MongoDB CRUD vs External API tabs)
├── server.js             # Express application entry point & route aggregator
├── package.json          # Node dependencies (express, mongoose, dotenv, cors)
├── test-server.js        # 69-point automated test verification suite
└── styles.css            # Responsive styling, design tokens, and dashboard components
```

---

## 🌐 3. Requirement 1 — External API Calls

PawGo fetches live data from public external REST APIs to show dynamic animal discoveries:

| Endpoint | Method | External Source URL | Output Data |
| :--- | :---: | :--- | :--- |
| `/api/external/dog-image` | `GET` | `https://dog.ceo/api/breeds/image/random` | Random dog photo URL and breed name |
| `/api/external/pet-facts` | `GET` | `https://catfact.ninja/fact` | Verified animal wellness and biological fact |
| `/api/external/discovery` | `GET` | Dog CEO + Cat Facts concurrently | Combined discovery bundle (Image + Fact + Care Tip) |

### Interactive UI:
Navigate to **`http://localhost:3000/records.html`** and click the **"🌐 External API Integration"** tab. Click **"↻ Fetch New External Pet Discovery"** to trigger live API queries that update the breed title, high-resolution photo, and wellness fact on screen without page reloads.

---

## 🚀 4. Requirement 2 — Node & Express Setup

The backend is built with **Node.js** and **Express 4**:
- **Environment Configuration (`.env`)**: Manages `PORT`, `MONGODB_URI`, and external API endpoints.
- **Middlewares**: `cors()` for Cross-Origin requests, `express.json()` for parsing request bodies, and custom static routing with clean `.html` extension aliases.
- **Safe Bootstrapping**: `config/db.js` attempts to connect to MongoDB with a non-blocking timeout. If MongoDB is offline, it logs a clear notification and enables in-memory fallback so the application and JSON APIs remain 100% operational without crashing.

---

## 📁 5. Requirement 3 — Local JSON Express APIs

Dedicated REST endpoints managing files in the [`data/`](file:///c:/Users/Ayush/Desktop/pawgo/data/) directory:

| Endpoint | Method | Action | Storage Target |
| :--- | :---: | :--- | :--- |
| `/api/json/bookings` | `GET` | Fetch all saved bookings | `data/bookings.json` |
| `/api/json/bookings` | `POST` | Save new booking record | `data/bookings.json` & `data/submissions.json` |
| `/api/json/contacts` | `GET` | Fetch all inquiries | `data/contacts.json` |
| `/api/json/contacts` | `POST` | Save contact message | `data/contacts.json` & `data/submissions.json` |
| `/api/json/providers` | `GET` | Fetch caregiver applications | `data/providers.json` |
| `/api/json/providers` | `POST` | Save provider application | `data/providers.json` & `data/submissions.json` |
| `/api/json/submissions`| `GET` | Fetch unified submissions | `data/submissions.json` (`?type=...`) |
| `/api/json/submissions/:id` | `DELETE` | Delete record by ID | Synchronously deletes from master & specific files |

---

## 🍃 6. Requirement 4 — MongoDB CRUD Express APIs

Full CRUD lifecycle implemented with Mongoose schemas and Express routers:

### 1. Create (POST)
- `POST /api/mongo/bookings`: Inserts a new booking document into MongoDB.
- `POST /api/mongo/contacts`: Inserts a new contact inquiry document.
- `POST /api/mongo/providers`: Inserts a new caregiver application.

### 2. Read (GET)
- `GET /api/mongo/status`: Returns MongoDB connection state (`connected: true/false`, host, database name, and live document counts).
- `GET /api/mongo/bookings`: Fetches all bookings sorted newest first (`?status=pending` supported).
- `GET /api/mongo/bookings/:id`: Fetches a single document by custom `id` (e.g. `pwg_...`) or MongoDB `_id`.
- `GET /api/mongo/contacts`: Fetches all customer inquiries.
- `GET /api/mongo/providers`: Fetches all caregiver applications.

### 3. Update (PUT & PATCH)
- `PUT /api/mongo/bookings/:id`: Full document replacement/update.
- `PATCH /api/mongo/bookings/:id`: Partial update (e.g., changes status: `pending` → `confirmed` → `completed` → `cancelled`, notes, or schedule).
- `PATCH /api/mongo/contacts/:id`: Updates inquiry status (`unread` → `read` → `resolved`).
- `PATCH /api/mongo/providers/:id`: Updates application status (`applied` → `approved`).

### 4. Delete (DELETE)
- `DELETE /api/mongo/bookings/:id`: Deletes document from MongoDB collection.
- `DELETE /api/mongo/contacts/:id`: Deletes inquiry document from MongoDB.
- `DELETE /api/mongo/providers/:id`: Deletes application document from MongoDB.

---

## 💻 7. Installation & Running Instructions

### Step 1: Open Terminal in Project Directory
```powershell
cd C:\Users\Ayush\Desktop\pawgo
```

### Step 2: Install Dependencies (Already installed in node_modules)
```powershell
npm install
```

### Step 3: MongoDB Configuration (Choose Option A or B)
- **Option A (Local MongoDB)**: Ensure your local MongoDB service is running (default: `mongodb://127.0.0.1:27017/pawgo`).
- **Option B (MongoDB Atlas Cloud)**: In `.env`, set:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pawgo?retryWrites=true&w=majority
  ```
- *Note: If MongoDB is offline, PawGo will automatically activate its in-memory fallback so you can still test CRUD operations seamlessly!*

### Step 4: Start the Server
```powershell
node server.js
```

### Step 5: Open in Your Browser
Navigate to:
**`http://localhost:3000`**

To test all 4 requirements in one visual dashboard, open:
**`http://localhost:3000/records.html`**

---

## 🧪 8. Automated Verification Suite

Run the comprehensive 69-point test suite:
```powershell
node test-server.js
```

**Verifies:**
- 9 HTML pages & navigation integrity.
- `.env` & `.env.example` existence.
- Mongoose models (`Booking`, `Contact`, `Provider`, `Newsletter`).
- Express APIs for Local JSON files (Create, Read, Delete).
- Express APIs for MongoDB CRUD operations (Create, Read All, Read Single, Patch/Update, Delete, Status).
- External API calls (`/api/external/dog-image`, `/api/external/pet-facts`, `/api/external/discovery`).
- Server-side validation rules (rejecting past dates, non-digit phones, whitespace-only fields).
- File crash resilience against malformed JSON.
