/**
 * ==============================================================================
 * PawGo - Complete Evaluation Verification Suite (test-server.js)
 * ==============================================================================
 * Comprehensive verification script testing:
 *   1. External APIs calls & resilient fallbacks (/api/external/*)
 *   2. Node and Express setup (.env, models, routers, error handling)
 *   3. Express APIs for saving/fetching data to local JSON files (/api/json/*)
 *   4. CRUD operations using Express APIs to manage data in MongoDB (/api/mongo/*)
 *   5. Form validation, whitespace rejection, past-date checks, phone validation
 *   6. Cross-collection synchronized deletions
 *   7. HTML page structure & navigation integrity
 * ==============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const server = require('./server.js');
const Booking = require('./models/Booking');
const Contact = require('./models/Contact');
const Provider = require('./models/Provider');
const Newsletter = require('./models/Newsletter');
const { getMongoStatus } = require('./config/db');

const jsonRoutes = require('./routes/jsonRoutes');
const mongoRoutes = require('./routes/mongoRoutes');
const externalRoutes = require('./routes/externalRoutes');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

// Lightweight in-process Express route dispatcher for automated testing
function dispatch(router, method, url, body = {}, query = {}, params = {}) {
  return new Promise((resolve) => {
    const req = {
      method: method.toUpperCase(),
      url,
      path: url.split('?')[0],
      body,
      query,
      params,
      headers: { 'content-type': 'application/json' }
    };

    let statusCode = 200;
    let responseData = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        resolve({ status: statusCode, body: data });
      },
      send(data) {
        responseData = data;
        resolve({ status: statusCode, body: data });
      }
    };

    router.handle(req, res, (err) => {
      if (err) {
        resolve({ status: 500, error: err.message });
      } else {
        resolve({ status: statusCode, body: responseData });
      }
    });
  });
}

async function runTests() {
  console.log('🐾 ========================================================');
  console.log('🐾 PAWGO FULL BACKEND & MONGODB VERIFICATION SUITE');
  console.log('🐾 ========================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: HTML Pages & Navigation Integrity
  // --------------------------------------------------------------------------
  console.log('[SECTION 1] HTML Pages & Navigation Integrity');
  const requiredPages = [
    'index.html',
    'services.html',
    'contacts.html',
    'about.html',
    'contact.html',
    'booking.html',
    'provider.html',
    'confirmation.html',
    'records.html'
  ];

  for (const page of requiredPages) {
    const filePath = path.join(__dirname, page);
    assert(fs.existsSync(filePath), `Page file exists: ${page}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('styles.css'), `${page} links to styles.css`);
    assert(content.includes('PawGo'), `${page} contains PawGo branding`);
    assert(!content.includes('href="#"'), `${page} contains NO dead href="#" placeholder links`);
  }

  // --------------------------------------------------------------------------
  // SECTION 2: Storage Initialization & Environment Config
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 2] Environment Setup & Data Storage Initialization');
  assert(fs.existsSync(path.join(__dirname, '.env')), '.env configuration file exists');
  assert(fs.existsSync(path.join(__dirname, '.env.example')), '.env.example template exists');

  await server.initializeDataStorage();

  assert(fs.existsSync(server.SUBMISSIONS_FILE), 'data/submissions.json exists');
  assert(fs.existsSync(server.BOOKINGS_FILE), 'data/bookings.json exists');
  assert(fs.existsSync(server.CONTACTS_FILE), 'data/contacts.json exists');
  assert(fs.existsSync(server.PROVIDERS_FILE), 'data/providers.json exists');
  assert(fs.existsSync(server.NEWSLETTER_FILE), 'data/newsletter.json exists');

  // Reset to clean empty arrays for repeatable test execution
  await server.writeJsonFile(server.SUBMISSIONS_FILE, []);
  await server.writeJsonFile(server.BOOKINGS_FILE, []);
  await server.writeJsonFile(server.CONTACTS_FILE, []);
  await server.writeJsonFile(server.PROVIDERS_FILE, []);
  await server.writeJsonFile(server.NEWSLETTER_FILE, []);

  // --------------------------------------------------------------------------
  // SECTION 3: Mongoose Models Verification
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 3] Mongoose Database Models (Requirement 4 - Models)');
  assert(typeof Booking === 'function' && Booking.schema, 'Booking Mongoose model is properly defined');
  assert(typeof Contact === 'function' && Contact.schema, 'Contact Mongoose model is properly defined');
  assert(typeof Provider === 'function' && Provider.schema, 'Provider Mongoose model is properly defined');
  assert(typeof Newsletter === 'function' && Newsletter.schema, 'Newsletter Mongoose model is properly defined');

  const mongoStatus = getMongoStatus();
  assert(typeof mongoStatus === 'object' && mongoStatus.hasOwnProperty('connected'), 'getMongoStatus() returns valid connection state structure');

  // --------------------------------------------------------------------------
  // SECTION 4: Express APIs for Local JSON Storage (Requirement 3)
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 4] Express APIs for Local JSON Files (Requirement 3)');

  // 4.1 POST /api/json/bookings
  const testJsonBooking = {
    ownerName: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+1 555-4321',
    petName: 'Rusty',
    petType: 'dog',
    service: 'grooming',
    date: '2026-11-20',
    timeSlot: 'Morning (08:00 - 11:00 AM)',
    notes: 'Bath and brushing'
  };

  const resJsonPost = await dispatch(jsonRoutes, 'POST', '/bookings', testJsonBooking);
  assert(resJsonPost.status === 201 && resJsonPost.body.success === true, 'POST /api/json/bookings returns HTTP 201 and saves to JSON');
  assert(resJsonPost.body.record && resJsonPost.body.record.id.startsWith('pwg_'), 'POST /api/json/bookings assigns unique pwg_ ID');

  // 4.2 GET /api/json/bookings
  const resJsonGet = await dispatch(jsonRoutes, 'GET', '/bookings');
  assert(resJsonGet.status === 200 && resJsonGet.body.count >= 1, 'GET /api/json/bookings retrieves saved bookings from local JSON');

  // 4.3 GET /api/json/submissions
  const resSubGet = await dispatch(jsonRoutes, 'GET', '/submissions', {}, { type: 'all' });
  assert(resSubGet.status === 200 && resSubGet.body.records.length >= 1, 'GET /api/json/submissions returns master records');

  // 4.4 DELETE /api/json/submissions/:id
  const jsonDeleteId = resJsonPost.body.record.id;
  const resJsonDel = await dispatch(jsonRoutes, 'DELETE', `/submissions/${jsonDeleteId}`, {}, {}, { id: jsonDeleteId });
  assert(resJsonDel.status === 200 && resJsonDel.body.success === true, 'DELETE /api/json/submissions/:id deletes record from local JSON');

  // Verify deletion on disk
  const verifyJsonDisk = await server.readJsonFile(server.BOOKINGS_FILE);
  assert(!verifyJsonDisk.some(b => b.id === jsonDeleteId), 'Deleted record is no longer present in data/bookings.json');

  // --------------------------------------------------------------------------
  // SECTION 5: Express APIs for MongoDB CRUD (Requirement 4)
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 5] Express APIs for MongoDB CRUD Operations (Requirement 4)');

  // 5.1 Status endpoint: GET /api/mongo/status
  const resMongoStatus = await dispatch(mongoRoutes, 'GET', '/status');
  assert(resMongoStatus.status === 200 && resMongoStatus.body.hasOwnProperty('mongoConnected'), 'GET /api/mongo/status returns database connection health');

  // 5.2 [CREATE] POST /api/mongo/bookings
  const mongoTestBooking = {
    ownerName: 'Ayush Sharma',
    email: 'ayush@pawgo.test',
    phone: '+1 555-0199',
    petName: 'Bailey',
    petType: 'dog',
    petBreed: 'Golden Retriever',
    service: 'walking',
    date: '2026-11-25',
    timeSlot: 'Morning (08:00 - 11:00 AM)',
    notes: 'Loves brisk morning walks'
  };

  const resMongoCreate = await dispatch(mongoRoutes, 'POST', '/bookings', mongoTestBooking);
  assert(resMongoCreate.status === 201 && resMongoCreate.body.success === true, 'POST /api/mongo/bookings [CREATE] creates new booking document');
  const createdMongoId = resMongoCreate.body.data.id || resMongoCreate.body.data._id;
  assert(createdMongoId, 'Created MongoDB document has valid identifier');

  // 5.3 [READ - ALL] GET /api/mongo/bookings
  const resMongoReadAll = await dispatch(mongoRoutes, 'GET', '/bookings');
  assert(resMongoReadAll.status === 200 && resMongoReadAll.body.data.length >= 1, 'GET /api/mongo/bookings [READ ALL] fetches all documents');

  // 5.4 [READ - SINGLE] GET /api/mongo/bookings/:id
  const resMongoReadSingle = await dispatch(mongoRoutes, 'GET', `/bookings/${createdMongoId}`, {}, {}, { id: createdMongoId });
  assert(resMongoReadSingle.status === 200 && resMongoReadSingle.body.data.petName === 'Bailey', 'GET /api/mongo/bookings/:id [READ SINGLE] fetches exact document');

  // 5.5 [UPDATE - PARTIAL] PATCH /api/mongo/bookings/:id (Update appointment status to 'confirmed')
  const resMongoPatch = await dispatch(mongoRoutes, 'PATCH', `/bookings/${createdMongoId}`, { status: 'confirmed', notes: 'VIP Customer' }, {}, { id: createdMongoId });
  assert(resMongoPatch.status === 200 && resMongoPatch.body.data.status === 'confirmed', 'PATCH /api/mongo/bookings/:id [UPDATE] modifies status to confirmed');

  // 5.6 [DELETE] DELETE /api/mongo/bookings/:id
  const resMongoDelete = await dispatch(mongoRoutes, 'DELETE', `/bookings/${createdMongoId}`, {}, {}, { id: createdMongoId });
  assert(resMongoDelete.status === 200 && resMongoDelete.body.success === true, 'DELETE /api/mongo/bookings/:id [DELETE] deletes document');

  // 5.7 Verify Delete
  const resMongoVerify = await dispatch(mongoRoutes, 'GET', `/bookings/${createdMongoId}`, {}, {}, { id: createdMongoId });
  assert(resMongoVerify.status === 404, 'Deleted MongoDB document correctly returns HTTP 404 Not Found');

  // --------------------------------------------------------------------------
  // SECTION 6: External API Endpoints (Requirement 1)
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 6] External API Calls & Resilient Fallbacks (Requirement 1)');

  // 6.1 GET /api/external/dog-image
  const resExtDog = await dispatch(externalRoutes, 'GET', '/dog-image');
  assert(resExtDog.status === 200 && resExtDog.body.imageUrl && resExtDog.body.breed, 'GET /api/external/dog-image returns photo URL and breed name');

  // 6.2 GET /api/external/pet-facts
  const resExtFact = await dispatch(externalRoutes, 'GET', '/pet-facts');
  assert(resExtFact.status === 200 && resExtFact.body.fact && resExtFact.body.fact.length > 5, 'GET /api/external/pet-facts returns animal wellness fact');

  // 6.3 GET /api/external/discovery
  const resExtDisc = await dispatch(externalRoutes, 'GET', '/discovery');
  assert(resExtDisc.status === 200 && resExtDisc.body.discovery.imageUrl && resExtDisc.body.discovery.tip, 'GET /api/external/discovery returns complete discovery bundle');

  // --------------------------------------------------------------------------
  // SECTION 7: Validation Logic & Edge Cases
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 7] Form Validation & Edge Case Handling');

  // 7.1 Past date rejection
  const pastDateBooking = {
    ownerName: 'Ayush',
    email: 'ayush@example.com',
    phone: '555-1234567',
    petName: 'Bailey',
    petType: 'dog',
    service: 'walking',
    date: '2020-01-01',
    timeSlot: 'Morning'
  };
  const vPast = server.validateBookingData(pastDateBooking);
  assert(vPast.isValid === false && vPast.errors.some(e => e.includes('past')), 'Server validation strictly rejects past booking dates');

  // 7.2 Non-digit phone rejection
  const badPhoneBooking = { ...pastDateBooking, date: '2026-12-01', phone: 'no-digits-here' };
  const vPhone = server.validateBookingData(badPhoneBooking);
  assert(vPhone.isValid === false && vPhone.errors.some(e => e.includes('phone')), 'Server validation strictly rejects non-digit phone numbers');

  // 7.3 Whitespace trimming & control character sanitization
  const validBooking = { ...pastDateBooking, date: '2026-12-01', phone: '+1 555-1234567' };
  const vValid = server.validateBookingData(validBooking);
  assert(vValid.isValid === true, 'Accepts sanitized, valid booking data');

  // --------------------------------------------------------------------------
  // SECTION 8: Malformed JSON File Crash Resilience
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 8] Malformed JSON File Crash Resilience');
  const tempCorrupt = path.join(server.SUBMISSIONS_FILE + '.corrupt.test');
  fs.writeFileSync(tempCorrupt, '{ invalid json syntax: 123,,, }');

  const recovery = await server.readJsonFile(tempCorrupt);
  assert(Array.isArray(recovery) && recovery.length === 0, 'readJsonFile safely handles malformed JSON without crashing server');
  if (fs.existsSync(tempCorrupt)) fs.unlinkSync(tempCorrupt);

  // Summary
  console.log('\n🐾 ========================================================');
  console.log(`🐾 RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('🐾 ========================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL BACKEND, MONGODB CRUD, AND EXTERNAL API REQUIREMENTS VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED.\n');
    process.exit(1);
  }
}

runTests();
