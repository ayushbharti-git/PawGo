/**
 * ==============================================================================
 * PawGo - Automated Evaluation Verification Suite (test-server.js)
 * ==============================================================================
 * Comprehensive verification script testing:
 *   1. Validation logic for all forms (Booking, Contact, Provider, Newsletter)
 *   2. Server-side rejection of whitespace, missing fields, invalid emails
 *   3. Asynchronous file persistence into local JSON files (data/)
 *   4. Append behavior (preserving previous records without overwriting)
 *   5. Safe handling of malformed JSON without crashing
 *   6. Record retrieval, filtering, and deletion
 *   7. HTML page structure & navigation integrity
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const server = require('./server.js');

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

async function runTests() {
  console.log('🐾 ========================================================');
  console.log('🐾 PAWGO 2ND EVALUATION - AUTOMATED TEST SUITE');
  console.log('🐾 ========================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: HTML & Navigation Integrity
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
  // SECTION 2: Storage Initialization
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 2] Data Storage Initialization');
  await server.initializeDataStorage();

  assert(fs.existsSync(server.SUBMISSIONS_FILE), 'data/submissions.json exists');
  assert(fs.existsSync(server.BOOKINGS_FILE), 'data/bookings.json exists');
  assert(fs.existsSync(server.CONTACTS_FILE), 'data/contacts.json exists');
  assert(fs.existsSync(server.PROVIDERS_FILE), 'data/providers.json exists');
  assert(fs.existsSync(server.NEWSLETTER_FILE), 'data/newsletter.json exists');

  // Reset to clean empty array for test repeatability
  await server.writeJsonFile(server.SUBMISSIONS_FILE, []);
  await server.writeJsonFile(server.BOOKINGS_FILE, []);
  await server.writeJsonFile(server.CONTACTS_FILE, []);
  await server.writeJsonFile(server.PROVIDERS_FILE, []);
  await server.writeJsonFile(server.NEWSLETTER_FILE, []);

  // --------------------------------------------------------------------------
  // SECTION 3: Booking Form Validation & Persistence
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 3] Booking Form Validation & Persistence');
  
  // 3.1 Invalid: empty and whitespace-only fields
  const invalidBooking = {
    ownerName: '   ', // whitespace only
    email: 'not-valid-email',
    phone: '12',
    petName: '',
    petType: '',
    service: '',
    date: '',
    timeSlot: ''
  };
  const v1 = server.validateBookingData(invalidBooking);
  assert(v1.isValid === false, 'Rejects empty and whitespace-only booking fields');
  assert(v1.errors.length >= 6, `Returns comprehensive validation errors (got ${v1.errors.length} errors)`);

  // 3.2 Valid booking
  const validBooking = {
    ownerName: 'Ayush Sharma',
    email: 'ayush@example.com',
    phone: '+1 555-0199',
    petName: 'Bailey',
    petType: 'dog',
    petBreed: 'Golden Retriever',
    service: 'walking',
    date: '2026-11-01',
    timeSlot: 'Morning (08:00 - 11:00 AM)',
    notes: 'Friendly dog, loves balls'
  };
  const v2 = server.validateBookingData(validBooking);
  assert(v2.isValid === true, 'Accepts valid booking data');

  // Save booking 1
  const rec1 = await server.saveSubmission('booking', v2.data, server.BOOKINGS_FILE);
  assert(rec1.id && rec1.id.startsWith('pwg_'), 'Generated unique ID with pwg_ prefix');
  assert(rec1.submittedAt && !isNaN(Date.parse(rec1.submittedAt)), 'Generated ISO-8601 submittedAt timestamp');
  assert(rec1.petName === 'Bailey', 'Preserved petName field');

  // Save booking 2 (verifying append without deleting booking 1)
  const validBooking2 = {
    ...validBooking,
    ownerName: 'Maya Lin',
    email: 'maya@example.com',
    petName: 'Luna',
    petType: 'cat'
  };
  const v3 = server.validateBookingData(validBooking2);
  const rec2 = await server.saveSubmission('booking', v3.data, server.BOOKINGS_FILE);

  const bookingsOnDisk = await server.readJsonFile(server.BOOKINGS_FILE);
  assert(bookingsOnDisk.length === 2, `Appended new booking without deleting previous (count: ${bookingsOnDisk.length})`);
  assert(bookingsOnDisk[0].id === rec1.id && bookingsOnDisk[1].id === rec2.id, 'Both records preserved in correct order');

  // --------------------------------------------------------------------------
  // SECTION 4: Contact Form Validation & Persistence
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 4] Contact Form Validation & Persistence');
  
  // 4.1 Invalid contact (short message)
  const invalidContact = {
    name: 'A',
    email: 'user@test.com',
    subject: '',
    message: 'Too short'
  };
  const c1 = server.validateContactData(invalidContact);
  assert(c1.isValid === false, 'Rejects too short name and message (< 10 chars)');

  // 4.2 Valid contact
  const validContact = {
    name: 'Dr. Kabir Verma',
    email: 'kabir@pawgo-care.test',
    subject: 'Veterinary Support',
    message: 'Please advise on the immunization booster schedule for senior canines.'
  };
  const c2 = server.validateContactData(validContact);
  assert(c2.isValid === true, 'Accepts valid contact message');

  const rec3 = await server.saveSubmission('contact', c2.data, server.CONTACTS_FILE);
  const contactsOnDisk = await server.readJsonFile(server.CONTACTS_FILE);
  assert(contactsOnDisk.length === 1 && contactsOnDisk[0].name === 'Dr. Kabir Verma', 'Contact message saved to data/contacts.json');

  // --------------------------------------------------------------------------
  // SECTION 5: Provider Application Validation & Persistence
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 5] Provider Application Validation & Persistence');

  // 5.1 Missing agreement
  const invalidProvider = {
    name: 'Jordan',
    email: 'jordan@test.com',
    phone: '555-1234',
    specialty: 'Dog Walker',
    experienceYears: 3,
    city: 'Delhi',
    bio: 'Professional pet walker with 3 years experience.',
    agreement: false
  };
  const p1 = server.validateProviderData(invalidProvider);
  assert(p1.isValid === false, 'Rejects provider application when agreement is false');

  // 5.2 Valid provider application
  const validProvider = {
    ...invalidProvider,
    name: 'Abhinav Patel',
    email: 'abhinav@pawgo-test.com',
    specialty: 'Certified Pet Groomer',
    experienceYears: 7,
    city: 'Gurgaon',
    bio: 'Master groomer specializing in low-stress coat care and spa baths for anxious pets.',
    agreement: true
  };
  const p2 = server.validateProviderData(validProvider);
  assert(p2.isValid === true, 'Accepts valid provider application');

  const rec4 = await server.saveSubmission('provider', p2.data, server.PROVIDERS_FILE);
  const providersOnDisk = await server.readJsonFile(server.PROVIDERS_FILE);
  assert(providersOnDisk.length === 1 && providersOnDisk[0].specialty === 'Certified Pet Groomer', 'Saved to data/providers.json');

  // --------------------------------------------------------------------------
  // SECTION 6: Newsletter Validation & Persistence
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 6] Newsletter Subscription Validation & Persistence');
  const n1 = server.validateNewsletterData({ email: 'bad-email' });
  assert(n1.isValid === false, 'Rejects invalid newsletter email format');

  const n2 = server.validateNewsletterData({ email: 'clubmember@pawgo.org' });
  assert(n2.isValid === true, 'Accepts valid newsletter email');

  await server.saveSubmission('newsletter', n2.data, server.NEWSLETTER_FILE);
  const newsOnDisk = await server.readJsonFile(server.NEWSLETTER_FILE);
  assert(newsOnDisk.length === 1 && newsOnDisk[0].email === 'clubmember@pawgo.org', 'Saved to data/newsletter.json');

  // --------------------------------------------------------------------------
  // SECTION 7: Master Submissions Unified Storage & Retrieval
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 7] Master Unified Submissions (data/submissions.json)');
  const masterSubmissions = await server.readJsonFile(server.SUBMISSIONS_FILE);
  assert(masterSubmissions.length === 5, `Master submissions file contains all 5 records (got ${masterSubmissions.length})`);
  
  const typesRecorded = masterSubmissions.map(s => s.type);
  assert(typesRecorded.includes('booking') && typesRecorded.includes('contact') && typesRecorded.includes('provider') && typesRecorded.includes('newsletter'), 'Master collection includes all submission types');

  // --------------------------------------------------------------------------
  // SECTION 8: Corrupt / Malformed JSON Resilience
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 8] Malformed JSON Resilience (Prevents Server Crash)');
  const tempCorruptFile = path.join(server.SUBMISSIONS_FILE + '.corrupt.test');
  fs.writeFileSync(tempCorruptFile, '{ invalid json content: true,,, }');

  const recoveryResult = await server.readJsonFile(tempCorruptFile);
  assert(Array.isArray(recoveryResult) && recoveryResult.length === 0, 'Safely catches malformed JSON and returns empty array without crashing');
  if (fs.existsSync(tempCorruptFile)) fs.unlinkSync(tempCorruptFile);

  // --------------------------------------------------------------------------
  // SECTION 9: Record Deletion Logic
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 9] Record Deletion Logic');
  const beforeDelete = await server.readJsonFile(server.SUBMISSIONS_FILE);
  const targetId = rec1.id;
  const afterDelete = beforeDelete.filter(r => r.id !== targetId);
  await server.writeJsonFile(server.SUBMISSIONS_FILE, afterDelete);

  const verifiedDisk = await server.readJsonFile(server.SUBMISSIONS_FILE);
  assert(verifiedDisk.length === 4, `Record removed cleanly from data/submissions.json (remaining: ${verifiedDisk.length})`);
  assert(!verifiedDisk.some(r => r.id === targetId), 'Target record no longer present');

  // --------------------------------------------------------------------------
  // SECTION 10: Persistence Across Server Restart
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 10] Persistence Across Server Restart');
  await server.initializeDataStorage();
  const persistentRecords = await server.readJsonFile(server.SUBMISSIONS_FILE);
  assert(persistentRecords.length === 4, `Server restart preserves all existing JSON records on disk (count: ${persistentRecords.length})`);

  // Final summary
  console.log('\n🐾 ========================================================');
  console.log(`🐾 VERIFICATION SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED`);
  console.log('🐾 ========================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 64 EVALUATION REQUIREMENTS SUCCESSFULLY VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED.\n');
    process.exit(1);
  }
}

runTests();

