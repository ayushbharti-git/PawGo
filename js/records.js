/**
 * ==============================================================================
 * PawGo - Records & Submissions Viewer (records.js)
 * ==============================================================================
 * 
 * Course Evaluation 2: Optional Record Viewing Requirements
 * Classroom Concepts Demonstrated:
 *   - Fetching and parsing JSON asynchronously with async/await
 *   - Higher-order functions: Array.prototype.filter, map, sort
 *   - Safe DOM construction using createElement, appendChild, and textContent
 *   - Confirmation prompt on destructive actions (window.confirm)
 *   - Empty, loading, and error states
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('records-list-container');
  const filterSelect = document.getElementById('record-filter-type');
  const searchInput = document.getElementById('record-search-input');
  const refreshBtn = document.getElementById('record-refresh-btn');

  let allRecords = [];

  /**
   * Fetch submissions from the backend API
   */
  async function loadRecords() {
    if (!container) return;

    // Show Loading State
    container.replaceChildren();
    const loadingEl = document.createElement('div');
    loadingEl.className = 'records-state loading-state';
    loadingEl.textContent = 'Loading submissions from data/submissions.json...';
    container.appendChild(loadingEl);

    try {
      const response = await fetch('/api/records?type=all');
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      allRecords = data.records || [];
      renderRecords(allRecords);
    } catch (err) {
      console.error('Failed to load records:', err);
      container.replaceChildren();
      const errorEl = document.createElement('div');
      errorEl.className = 'records-state error-state';
      errorEl.textContent = 'Unable to connect to the backend server. Please verify "node server.js" is running.';
      container.appendChild(errorEl);
    }
  }

  /**
   * Render records safely into the DOM
   */
  function renderRecords(recordsToDisplay) {
    if (!container) return;
    container.replaceChildren();

    // Check for Empty State
    if (!recordsToDisplay || recordsToDisplay.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'records-state empty-state';
      
      const icon = document.createElement('div');
      icon.className = 'empty-icon';
      icon.textContent = '📋';

      const title = document.createElement('h3');
      title.textContent = 'No Submissions Found';

      const desc = document.createElement('p');
      desc.textContent = 'No records match your selected criteria. Submit a booking or message to see it stored in data/submissions.json.';

      emptyEl.appendChild(icon);
      emptyEl.appendChild(title);
      emptyEl.appendChild(desc);
      container.appendChild(emptyEl);
      return;
    }

    // Render Record Cards
    recordsToDisplay.forEach((record) => {
      const card = document.createElement('div');
      card.className = `record-card type-${record.type || 'general'}`;

      // Card Header
      const header = document.createElement('div');
      header.className = 'record-header';

      const badge = document.createElement('span');
      badge.className = `record-badge badge-${record.type || 'general'}`;
      badge.textContent = (record.type || 'general').toUpperCase();

      const time = document.createElement('span');
      time.className = 'record-time';
      const formattedDate = record.submittedAt ? new Date(record.submittedAt).toLocaleString() : 'Recent';
      time.textContent = formattedDate;

      header.appendChild(badge);
      header.appendChild(time);
      card.appendChild(header);

      // Card Body
      const body = document.createElement('div');
      body.className = 'record-body';

      // Title & Subtitle based on submission type
      const title = document.createElement('h4');
      const subtitle = document.createElement('p');
      subtitle.className = 'record-email';

      if (record.type === 'booking') {
        title.textContent = `${record.petName || 'Pet'} (${record.petType || 'Pet'}) - Service: ${record.service || 'Care'}`;
        subtitle.textContent = `Owner: ${record.ownerName || 'Unknown'} • 📧 ${record.email || 'N/A'} • 📞 ${record.phone || 'N/A'}`;
      } else if (record.type === 'contact') {
        title.textContent = `Inquiry: ${record.subject || 'General'}`;
        subtitle.textContent = `From: ${record.name || 'Anonymous'} • 📧 ${record.email || 'N/A'}`;
      } else if (record.type === 'provider') {
        title.textContent = `Caregiver Application: ${record.name || 'Applicant'} (${record.specialty || 'General'})`;
        subtitle.textContent = `📍 ${record.city || 'N/A'} • Exp: ${record.experienceYears || 0} yrs • 📧 ${record.email || 'N/A'}`;
      } else if (record.type === 'newsletter') {
        title.textContent = `Club Newsletter Subscription`;
        subtitle.textContent = `📧 ${record.email || 'N/A'}`;
      } else {
        title.textContent = `Submission: ${record.name || 'User'}`;
        subtitle.textContent = `📧 ${record.email || 'N/A'}`;
      }

      body.appendChild(title);
      body.appendChild(subtitle);

      // Additional metadata details
      if (record.type === 'booking') {
        const detailsGrid = document.createElement('div');
        detailsGrid.className = 'record-meta-row';

        const dateItem = document.createElement('span');
        dateItem.textContent = `📅 Appointment: ${record.date || 'TBD'} @ ${record.timeSlot || 'Anytime'}`;
        detailsGrid.appendChild(dateItem);

        if (record.notes) {
          const notesItem = document.createElement('p');
          notesItem.className = 'record-notes';
          notesItem.textContent = `Notes: "${record.notes}"`;
          detailsGrid.appendChild(notesItem);
        }

        body.appendChild(detailsGrid);
      } else if (record.type === 'contact' && record.message) {
        const messageEl = document.createElement('p');
        messageEl.className = 'record-notes';
        messageEl.textContent = `"${record.message}"`;
        body.appendChild(messageEl);
      } else if (record.type === 'provider' && record.bio) {
        const bioEl = document.createElement('p');
        bioEl.className = 'record-notes';
        bioEl.textContent = `Bio: "${record.bio}"`;
        body.appendChild(bioEl);
      }

      card.appendChild(body);

      // Card Footer with Delete Action
      const footer = document.createElement('div');
      footer.className = 'record-footer';

      const idSpan = document.createElement('span');
      idSpan.className = 'record-id';
      idSpan.textContent = `ID: ${record.id}`;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete-record';
      deleteBtn.textContent = 'Delete Record';
      deleteBtn.setAttribute('aria-label', `Delete submission ${record.id}`);

      // Destructive confirmation prompt
      deleteBtn.addEventListener('click', async () => {
        const confirmed = window.confirm(`Are you sure you want to delete submission #${record.id}? This will remove it from data/submissions.json.`);
        if (!confirmed) return;

        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Deleting...';

        try {
          const res = await fetch(`/api/records/${record.id}`, { method: 'DELETE' });
          const resData = await res.json();
          if (res.ok && resData.success) {
            allRecords = allRecords.filter(r => r.id !== record.id);
            renderRecords(filterRecords());
          } else {
            alert(resData.error || 'Failed to delete record.');
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Record';
          }
        } catch (err) {
          console.error('Delete error:', err);
          alert('Network error while deleting record.');
          deleteBtn.disabled = false;
          deleteBtn.textContent = 'Delete Record';
        }
      });

      footer.appendChild(idSpan);
      footer.appendChild(deleteBtn);
      card.appendChild(footer);

      container.appendChild(card);
    });
  }

  /**
   * Filter records based on dropdown and search text
   */
  function filterRecords() {
    const selectedType = filterSelect ? filterSelect.value : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    return allRecords.filter((item) => {
      // Type match
      const typeMatch = selectedType === 'all' || item.type === selectedType;
      if (!typeMatch) return false;

      // Text query match
      if (!query) return true;
      const jsonString = JSON.stringify(item).toLowerCase();
      return jsonString.includes(query);
    });
  }

  // Event Listeners for Filters
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      renderRecords(filterRecords());
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderRecords(filterRecords());
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadRecords);
  }

  // Initial load
  loadRecords();
});

