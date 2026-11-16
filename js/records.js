/**
 * ==============================================================================
 * PawGo - Records, MongoDB CRUD & External API Controller (js/records.js)
 * ==============================================================================
 * Requirements Demonstrated:
 *   1. Fetching and showing data via External APIs calls (/api/external/*)
 *   3. Express APIs creation to save/fetch data to local JSON files (/api/json/*)
 *   4. CRUD operations using Express APIs to manage data in MongoDB (/api/mongo/*)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Tab Elements
  const tabButtons = document.querySelectorAll('.dashboard-tab-btn');
  const tabPanels = {
    'tab-json': document.getElementById('tab-json-content'),
    'tab-mongo': document.getElementById('tab-mongo-content'),
    'tab-external': document.getElementById('tab-external-content')
  };

  let activeTab = 'tab-json';

  // Common Controls
  const filterSelect = document.getElementById('record-filter-type');
  const searchInput = document.getElementById('record-search-input');
  const refreshBtn = document.getElementById('record-refresh-btn');

  // Containers
  const jsonContainer = document.getElementById('records-list-container');
  const mongoContainer = document.getElementById('mongo-records-container');

  // Status Bar Elements
  const mongoIndicator = document.getElementById('mongo-indicator');
  const mongoStatusText = document.getElementById('mongo-status-text');
  const mongoCountsText = document.getElementById('mongo-counts-text');

  // External API Elements
  const btnFetchExternal = document.getElementById('btn-fetch-external');
  const externalPetImg = document.getElementById('external-pet-img');
  const externalBreedTitle = document.getElementById('external-breed-title');
  const externalFactText = document.getElementById('external-fact-text');
  const externalTipText = document.getElementById('external-tip-text');

  // Create Test MongoDB Button
  const btnCreateTestMongo = document.getElementById('btn-create-test-mongo');

  let localJsonRecords = [];
  let mongoBookings = [];

  // ----------------------------------------------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------------------------------------------
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      activeTab = targetTab;

      tabButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      Object.keys(tabPanels).forEach(key => {
        if (tabPanels[key]) {
          tabPanels[key].style.display = key === targetTab ? 'block' : 'none';
        }
      });

      if (targetTab === 'tab-json') {
        loadJsonRecords();
      } else if (targetTab === 'tab-mongo') {
        loadMongoBookings();
      } else if (targetTab === 'tab-external') {
        fetchExternalDiscovery();
      }
    });
  });

  // ----------------------------------------------------------------------------
  // DATABASE STATUS CHECK
  // ----------------------------------------------------------------------------
  async function checkDatabaseStatus() {
    try {
      const res = await fetch('/api/mongo/status');
      const data = await res.json();

      if (data.mongoConnected) {
        mongoIndicator.className = 'db-indicator-dot online';
        mongoStatusText.textContent = `🍃 MongoDB Connected (${data.database.host || '127.0.0.1'}/${data.database.dbName || 'pawgo'})`;
      } else {
        mongoIndicator.className = 'db-indicator-dot offline';
        mongoStatusText.textContent = '⚠️ MongoDB Offline (In-Memory Fallback Active for CRUD demo)';
      }

      if (data.counts) {
        mongoCountsText.textContent = `Live Docs: ${data.counts.bookings} bookings, ${data.counts.contacts} contacts, ${data.counts.providers} providers`;
      }
    } catch (e) {
      mongoIndicator.className = 'db-indicator-dot offline';
      mongoStatusText.textContent = 'Server connecting...';
    }
  }

  // ----------------------------------------------------------------------------
  // 1. LOCAL JSON RECORDS (Requirement 3)
  // ----------------------------------------------------------------------------
  async function loadJsonRecords() {
    if (!jsonContainer) return;

    jsonContainer.replaceChildren();
    const loadingEl = document.createElement('div');
    loadingEl.className = 'records-state loading-state';
    loadingEl.textContent = 'Loading records from local JSON files (/api/json/submissions)...';
    jsonContainer.appendChild(loadingEl);

    try {
      const res = await fetch('/api/json/submissions?type=all');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      localJsonRecords = data.records || [];
      renderJsonRecords(filterRecords(localJsonRecords));
    } catch (err) {
      jsonContainer.replaceChildren();
      const errEl = document.createElement('div');
      errEl.className = 'records-state error-state';
      errEl.textContent = 'Unable to fetch local JSON records. Ensure node server.js is running.';
      jsonContainer.appendChild(errEl);
    }
  }

  function renderJsonRecords(records) {
    if (!jsonContainer) return;
    jsonContainer.replaceChildren();

    if (!records || records.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'records-state empty-state';
      empty.innerHTML = `
        <div class="empty-icon">📁</div>
        <h3>No Local JSON Records Found</h3>
        <p>No records match your criteria in <code>data/submissions.json</code>.</p>
      `;
      jsonContainer.appendChild(empty);
      return;
    }

    records.forEach(rec => {
      const card = document.createElement('div');
      card.className = `record-card type-${rec.type || 'general'}`;

      const header = document.createElement('div');
      header.className = 'record-header';

      const badge = document.createElement('span');
      badge.className = `record-badge badge-${rec.type || 'general'}`;
      badge.textContent = `JSON: ${(rec.type || 'general').toUpperCase()}`;

      const time = document.createElement('span');
      time.className = 'record-time';
      time.textContent = rec.submittedAt ? new Date(rec.submittedAt).toLocaleString() : 'Recent';

      header.appendChild(badge);
      header.appendChild(time);
      card.appendChild(header);

      const body = document.createElement('div');
      body.className = 'record-body';

      const title = document.createElement('h4');
      const subtitle = document.createElement('p');
      subtitle.className = 'record-email';

      if (rec.type === 'booking') {
        title.textContent = `${rec.petName || 'Pet'} (${rec.petType || 'dog'}) • ${rec.service || 'Care'}`;
        subtitle.textContent = `Owner: ${rec.ownerName || 'Unknown'} • 📧 ${rec.email || 'N/A'} • 📞 ${rec.phone || 'N/A'}`;
      } else if (rec.type === 'contact') {
        title.textContent = `Inquiry: ${rec.subject || 'General'}`;
        subtitle.textContent = `From: ${rec.name || 'User'} • 📧 ${rec.email || 'N/A'}`;
      } else if (rec.type === 'provider') {
        title.textContent = `Caregiver: ${rec.name || 'Applicant'} (${rec.specialty || 'General'})`;
        subtitle.textContent = `📍 ${rec.city || 'N/A'} • Exp: ${rec.experienceYears || 0} yrs • 📧 ${rec.email || 'N/A'}`;
      } else {
        title.textContent = `Submission: ${rec.name || rec.email || 'User'}`;
        subtitle.textContent = `📧 ${rec.email || 'N/A'}`;
      }

      body.appendChild(title);
      body.appendChild(subtitle);
      card.appendChild(body);

      const footer = document.createElement('div');
      footer.className = 'record-footer';

      const idSpan = document.createElement('span');
      idSpan.className = 'record-id';
      idSpan.textContent = `ID: ${rec.id}`;

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete-record';
      delBtn.textContent = 'Delete JSON Record';
      delBtn.addEventListener('click', async () => {
        if (!confirm(`Delete record #${rec.id} from local JSON file?`)) return;
        delBtn.disabled = true;
        try {
          const res = await fetch(`/api/json/submissions/${rec.id}`, { method: 'DELETE' });
          if (res.ok) {
            localJsonRecords = localJsonRecords.filter(r => r.id !== rec.id);
            renderJsonRecords(filterRecords(localJsonRecords));
            checkDatabaseStatus();
          } else {
            alert('Failed to delete record.');
            delBtn.disabled = false;
          }
        } catch (e) {
          alert('Network error while deleting.');
          delBtn.disabled = false;
        }
      });

      footer.appendChild(idSpan);
      footer.appendChild(delBtn);
      card.appendChild(footer);

      jsonContainer.appendChild(card);
    });
  }

  // ----------------------------------------------------------------------------
  // 2. MONGODB CRUD OPERATIONS (Requirement 4)
  // ----------------------------------------------------------------------------
  async function loadMongoBookings() {
    if (!mongoContainer) return;

    mongoContainer.replaceChildren();
    const loadingEl = document.createElement('div');
    loadingEl.className = 'records-state loading-state';
    loadingEl.textContent = 'Fetching documents from MongoDB (/api/mongo/bookings)...';
    mongoContainer.appendChild(loadingEl);

    try {
      const res = await fetch('/api/mongo/bookings');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      mongoBookings = data.data || [];
      renderMongoBookings(filterRecords(mongoBookings));
      checkDatabaseStatus();
    } catch (err) {
      mongoContainer.replaceChildren();
      const errEl = document.createElement('div');
      errEl.className = 'records-state error-state';
      errEl.textContent = 'Error connecting to MongoDB API endpoint.';
      mongoContainer.appendChild(errEl);
    }
  }

  function renderMongoBookings(bookings) {
    if (!mongoContainer) return;
    mongoContainer.replaceChildren();

    if (!bookings || bookings.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'records-state empty-state';
      empty.innerHTML = `
        <div class="empty-icon">🍃</div>
        <h3>No MongoDB Documents Found</h3>
        <p>Click "<strong>+ Create MongoDB Test Booking</strong>" above to test the Create (POST) API!</p>
      `;
      mongoContainer.appendChild(empty);
      return;
    }

    bookings.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'record-card';

      // Header with MongoDB & Status Badge
      const header = document.createElement('div');
      header.className = 'record-header';

      const badge = document.createElement('span');
      badge.className = 'record-badge';
      badge.style.background = '#dcfce7';
      badge.style.color = '#15803d';
      badge.textContent = `MONGO DOC`;

      const statusBadge = document.createElement('span');
      statusBadge.className = `badge-status status-${doc.status || 'pending'}`;
      statusBadge.textContent = (doc.status || 'pending').toUpperCase();

      header.appendChild(badge);
      header.appendChild(statusBadge);
      card.appendChild(header);

      // Body
      const body = document.createElement('div');
      body.className = 'record-body';

      const title = document.createElement('h4');
      title.textContent = `${doc.petName} (${doc.petType}) - Service: ${doc.service}`;

      const subtitle = document.createElement('p');
      subtitle.className = 'record-email';
      subtitle.textContent = `Owner: ${doc.ownerName} • 📧 ${doc.email} • 📞 ${doc.phone || 'N/A'}`;

      const meta = document.createElement('div');
      meta.className = 'record-meta-row';
      meta.innerHTML = `📅 <strong>Schedule:</strong> ${doc.date} (${doc.timeSlot})<br>📝 <strong>Notes:</strong> ${doc.notes || 'None'}`;

      body.appendChild(title);
      body.appendChild(subtitle);
      body.appendChild(meta);
      card.appendChild(body);

      // Footer with Status Update (PATCH) and Delete (DELETE) CRUD controls
      const footer = document.createElement('div');
      footer.className = 'record-footer';

      const idBox = document.createElement('div');
      idBox.innerHTML = `<span class="record-id">ID: ${doc.id || doc._id}</span>`;

      const actionsBox = document.createElement('div');
      actionsBox.style.display = 'flex';
      actionsBox.style.gap = '0.5rem';
      actionsBox.style.alignItems = 'center';

      // Status selector (CRUD Update: PATCH)
      const selectStatus = document.createElement('select');
      selectStatus.className = 'status-select-action';
      selectStatus.innerHTML = `
        <option value="pending" ${doc.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="confirmed" ${doc.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
        <option value="completed" ${doc.status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="cancelled" ${doc.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      `;

      selectStatus.addEventListener('change', async () => {
        const newStatus = selectStatus.value;
        try {
          const res = await fetch(`/api/mongo/bookings/${doc.id || doc._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          const result = await res.json();
          if (res.ok && result.success) {
            doc.status = newStatus;
            statusBadge.className = `badge-status status-${newStatus}`;
            statusBadge.textContent = newStatus.toUpperCase();
          } else {
            alert('Failed to update status.');
          }
        } catch (e) {
          alert('Network error updating status.');
        }
      });

      // Delete Button (CRUD Delete: DELETE)
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete-record';
      delBtn.textContent = 'Delete Doc';
      delBtn.addEventListener('click', async () => {
        if (!confirm(`Delete MongoDB booking document #${doc.id || doc._id}?`)) return;
        delBtn.disabled = true;
        try {
          const res = await fetch(`/api/mongo/bookings/${doc.id || doc._id}`, { method: 'DELETE' });
          if (res.ok) {
            mongoBookings = mongoBookings.filter(b => b.id !== doc.id && b._id !== doc._id);
            renderMongoBookings(filterRecords(mongoBookings));
            checkDatabaseStatus();
          } else {
            alert('Failed to delete document from MongoDB.');
            delBtn.disabled = false;
          }
        } catch (e) {
          alert('Network error deleting document.');
          delBtn.disabled = false;
        }
      });

      actionsBox.appendChild(selectStatus);
      actionsBox.appendChild(delBtn);

      footer.appendChild(idBox);
      footer.appendChild(actionsBox);
      card.appendChild(footer);

      mongoContainer.appendChild(card);
    });
  }

  // Create Test MongoDB Document
  if (btnCreateTestMongo) {
    btnCreateTestMongo.addEventListener('click', async () => {
      btnCreateTestMongo.disabled = true;
      btnCreateTestMongo.textContent = 'Creating...';

      const testPayload = {
        ownerName: 'MongoDB Test Parent',
        email: `tester_${Date.now()}@pawgo.test`,
        phone: '+1 555-0199',
        petName: 'Milo',
        petType: 'dog',
        petBreed: 'Beagle',
        service: 'walking',
        date: new Date().toISOString().split('T')[0],
        timeSlot: 'Morning (08:00 - 11:00 AM)',
        notes: 'Created via MongoDB Live CRUD Dashboard'
      };

      try {
        const res = await fetch('/api/mongo/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload)
        });
        const result = await res.json();

        if (res.ok && result.success) {
          await loadMongoBookings();
        } else {
          alert(result.error || 'Failed to create test document.');
        }
      } catch (err) {
        alert('Could not connect to server.');
      } finally {
        btnCreateTestMongo.disabled = false;
        btnCreateTestMongo.textContent = '+ Create MongoDB Test Booking';
      }
    });
  }

  // ----------------------------------------------------------------------------
  // 3. EXTERNAL API INTEGRATION (Requirement 1)
  // ----------------------------------------------------------------------------
  async function fetchExternalDiscovery() {
    if (!btnFetchExternal) return;

    btnFetchExternal.disabled = true;
    btnFetchExternal.textContent = 'Fetching External API...';

    try {
      const res = await fetch('/api/external/discovery');
      const data = await res.json();

      if (data.success && data.discovery) {
        if (externalPetImg && data.discovery.imageUrl) {
          externalPetImg.src = data.discovery.imageUrl;
        }
        if (externalFactText && data.discovery.fact) {
          externalFactText.textContent = data.discovery.fact;
        }
        if (externalTipText && data.discovery.tip) {
          externalTipText.textContent = data.discovery.tip;
        }
      }
    } catch (e) {
      console.warn('Error fetching external API:', e);
    } finally {
      btnFetchExternal.disabled = false;
      btnFetchExternal.textContent = '↻ Fetch New External Pet Discovery';
    }
  }

  if (btnFetchExternal) {
    btnFetchExternal.addEventListener('click', fetchExternalDiscovery);
  }

  // ----------------------------------------------------------------------------
  // COMMON FILTER & SEARCH
  // ----------------------------------------------------------------------------
  function filterRecords(list) {
    const selectedType = filterSelect ? filterSelect.value : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    return list.filter(item => {
      const typeMatch = selectedType === 'all' || item.type === selectedType || (item.service && selectedType === 'booking');
      if (!typeMatch) return false;

      if (!query) return true;
      const jsonStr = JSON.stringify(item).toLowerCase();
      return jsonStr.includes(query);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      if (activeTab === 'tab-json') renderJsonRecords(filterRecords(localJsonRecords));
      else if (activeTab === 'tab-mongo') renderMongoBookings(filterRecords(mongoBookings));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (activeTab === 'tab-json') renderJsonRecords(filterRecords(localJsonRecords));
      else if (activeTab === 'tab-mongo') renderMongoBookings(filterRecords(mongoBookings));
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      checkDatabaseStatus();
      if (activeTab === 'tab-json') loadJsonRecords();
      else if (activeTab === 'tab-mongo') loadMongoBookings();
      else if (activeTab === 'tab-external') fetchExternalDiscovery();
    });
  }

  // Initial Load
  checkDatabaseStatus();
  loadJsonRecords();
});
