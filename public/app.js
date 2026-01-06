// DOM Elements
const entryForm = document.getElementById('entry-form');
const entryId = document.getElementById('entry-id');
const entryTitle = document.getElementById('entry-title');
const entryContent = document.getElementById('entry-content');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const entriesList = document.getElementById('entries-list');
const modal = document.getElementById('entry-modal');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');

let currentEntry = null;

// API Functions
async function fetchEntries(search = '') {
  const url = search ? `/api/entries?search=${encodeURIComponent(search)}` : '/api/entries';
  const response = await fetch(url);
  return response.json();
}

async function createEntry(title, content) {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  return response.json();
}

async function updateEntry(id, title, content) {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  return response.json();
}

async function deleteEntry(id) {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'DELETE'
  });
  return response.json();
}

// UI Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderEntries(entries) {
  if (entries.length === 0) {
    entriesList.innerHTML = '<div class="no-entries">No journal entries yet. Start writing!</div>';
    return;
  }

  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-card" data-id="${entry.id}">
      <h3>${entry.title || 'Untitled'}</h3>
      <div class="date">${formatDate(entry.created_at)}</div>
      <div class="preview">${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.entry-card').forEach(card => {
    card.addEventListener('click', () => openEntry(card.dataset.id));
  });
}

async function loadEntries() {
  const search = searchInput.value;
  const entries = await fetchEntries(search);
  renderEntries(entries);
}

async function openEntry(id) {
  const entries = await fetchEntries();
  currentEntry = entries.find(e => e.id === parseInt(id));

  if (currentEntry) {
    modalTitle.textContent = currentEntry.title || 'Untitled';
    modalDate.textContent = formatDate(currentEntry.created_at);
    modalContent.textContent = currentEntry.content;
    modal.style.display = 'block';
  }
}

function closeModalHandler() {
  modal.style.display = 'none';
  currentEntry = null;
}

function resetForm() {
  entryId.value = '';
  entryTitle.value = '';
  entryContent.value = '';
  submitBtn.textContent = 'Save Entry';
  cancelBtn.style.display = 'none';
}

function editEntry() {
  if (currentEntry) {
    entryId.value = currentEntry.id;
    entryTitle.value = currentEntry.title || '';
    entryContent.value = currentEntry.content;
    submitBtn.textContent = 'Update Entry';
    cancelBtn.style.display = 'block';
    closeModalHandler();
    entryContent.focus();
  }
}

async function handleDelete() {
  if (currentEntry && confirm('Are you sure you want to delete this entry?')) {
    await deleteEntry(currentEntry.id);
    closeModalHandler();
    loadEntries();
  }
}

// Event Listeners
entryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = entryTitle.value.trim();
  const content = entryContent.value.trim();

  if (!content) return;

  if (entryId.value) {
    await updateEntry(entryId.value, title, content);
  } else {
    await createEntry(title, content);
  }

  resetForm();
  loadEntries();
});

cancelBtn.addEventListener('click', resetForm);

searchInput.addEventListener('input', debounce(loadEntries, 300));

closeModal.addEventListener('click', closeModalHandler);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModalHandler();
});

editBtn.addEventListener('click', editEntry);
deleteBtn.addEventListener('click', handleDelete);

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initial load
loadEntries();
