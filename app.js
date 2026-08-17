// ==================== STATE ====================
let allApps = [];
let activeFilter = 'all';
let activeSection = 'apps'; // 'apps' | 'bookmarks'
let appSearchQuery = '';
let bookmarks = loadBookmarksFromStorage();
let editingBookmarkId = null;
let bmSearchQuery = '';

// ==================== ELEMENTS ====================
const appsGrid = document.getElementById('appsGrid');
const bookmarksPanel = document.getElementById('bookmarksPanel');
const bookmarksGrid = document.getElementById('bookmarksGrid');
const appSearchInput = document.getElementById('appSearchInput');
const bmSearchInput = document.getElementById('bookmarkSearch');
const refreshBtn = document.getElementById('refreshBtn');
const navTabs = document.querySelectorAll('.nav-tab');
const toastContainer = document.getElementById('toastContainer');
const bookmarkModal = document.getElementById('bookmarkModal');
const bookmarkCountEl = document.getElementById('bookmarkCount');

// ==================== TOAST ====================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== SECTION SWITCHING ====================
function showSection(section) {
  activeSection = section;
  if (section === 'bookmarks') {
    appsGrid.style.display = 'none';
    bookmarksPanel.classList.add('active');
    renderBookmarks();
  } else {
    appsGrid.style.display = '';
    bookmarksPanel.classList.remove('active');
  }
}

// Built-in Static App Registry for Cloud / GitHub Pages Fallback
const DEFAULT_APPS_FALLBACK = [
  {
    id: 'photo-studio',
    name: 'Photo & 3D Text Studio',
    banglaName: 'ফটো ও ৩D টেক্সট স্টুডিও',
    hasDesktop: true,
    hasBrowser: true,
    badge: 'Desktop & Web',
    category: 'creative',
    icon: '📷',
    accentColor: '#f59e0b',
    description: 'Advanced photo editing, AI background removal, filter presets, and full 3D extruded vector text studio.',
    webUrl: 'http://localhost:4200/index.html'
  },
  {
    id: 'video-editor',
    name: 'Video Editor Pro',
    banglaName: 'ভিডিও এডিটর প্রো',
    hasDesktop: true,
    hasBrowser: true,
    badge: 'Desktop & Web',
    category: 'creative',
    icon: '🎬',
    accentColor: '#38bdf8',
    description: 'Multi-track video editing, AI Bangla voice typing, automated subtitle generator, transitions, and 3D visual templates.',
    webUrl: 'http://localhost:4000'
  },
  {
    id: 'pdf-desktop',
    name: 'Antigravity PDF Pro',
    banglaName: 'অ্যান্টিগ্র্যাভিটি পিডিএফ প্রো (ডেস্কটপ)',
    hasDesktop: true,
    hasBrowser: false,
    badge: 'Desktop Pro',
    category: 'document',
    icon: '📑',
    accentColor: '#ef4444',
    description: 'Professional desktop PDF studio: advanced page editing, offline conversion, watermark, e-sign, and OCR integration.'
  },
  {
    id: 'pdf-suite',
    name: 'PDF Editor Website',
    banglaName: 'পিডিএফ এডিটর ওয়েবসাইট',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Web App',
    category: 'document',
    icon: '📄',
    accentColor: '#fb7185',
    description: 'Cloud-ready PDF tools suite: fast merge, split, annotate, signature, watermark, and PDF-to-image converter.',
    webUrl: 'http://localhost:3456/index.html'
  },
  {
    id: 'warisha-fashion',
    name: 'Warisha Fashion',
    banglaName: 'ওয়ারিশা ফ্যাশন (ইআরপি ও সেলস)',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Business ERP',
    category: 'business',
    icon: '👗',
    accentColor: '#ec4899',
    description: 'Complete ERP suite: sales, purchase catalog, cash ledger, automated invoice generator, inventory audit, and analytics.',
    webUrl: 'http://localhost:3500/index.html'
  },
  {
    id: 'wings-fly-academy',
    name: 'Wings Fly Aviation Academy',
    banglaName: 'উইংস ফ্লাই এভিয়েশন একাডেমি',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Academy Suite',
    category: 'education',
    icon: '✈️',
    accentColor: '#0ea5e9',
    description: 'Aviation training academy platform: student portal, exam system, routine management, certificate verification, and CRM.',
    webUrl: 'http://localhost:3600/index.html'
  },
  {
    id: 'wings-fly-public',
    name: 'Wings Fly Public Website',
    banglaName: 'উইংস ফ্লাই পাবলিক ওয়েবসাইট',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Public Website',
    category: 'education',
    icon: '🌐',
    accentColor: '#06b6d4',
    description: 'Official public-facing portal for Wings Fly: course listings, admissions, student dashboard, and news updates.',
    webUrl: 'http://localhost:3700/index.html'
  },
  {
    id: 'acade-flow',
    name: 'Acade Flow',
    banglaName: 'অ্যাকাডে ফ্লো',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Web App',
    category: 'education',
    icon: '🎓',
    accentColor: '#10b981',
    description: 'Next-generation education and student learning dashboard, curriculum management, and online academy portal.',
    webUrl: 'http://localhost:3780/index.html'
  },
  {
    id: 'wings-fly-foundation',
    name: 'Wings Fly Foundation',
    banglaName: 'উইংস ফ্লাই ফাউন্ডেশন',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Ledger & Accounts',
    category: 'finance',
    icon: '🕊️',
    accentColor: '#8b5cf6',
    description: 'Client ledger management, charitable accounts, donor records, and transparent financial reporting system.',
    webUrl: 'http://localhost:3890/index.html'
  }
];

// ==================== APPS ====================
async function loadApps() {
  try {
    const res = await fetch('/api/apps');
    if (!res.ok) throw new Error('API unavailable');
    allApps = await res.json();
  } catch (err) {
    // Cloud / GitHub Pages mode fallback
    console.log('[Shakib Hub] Running in Cloud / GitHub Pages Mode');
    allApps = DEFAULT_APPS_FALLBACK;
  }
  if (activeSection === 'apps') renderApps();
}

function renderApps() {
  const filtered = allApps.filter(app => {
    const matchCat = activeFilter === 'all' || app.category === activeFilter;
    const q = appSearchQuery;
    const matchSearch = !q || app.name.toLowerCase().includes(q) ||
      (app.banglaName || '').toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (!filtered.length) {
    appsGrid.innerHTML = `<div class="loading-state"><i class="fa-solid fa-box-open"></i><span>কোনো অ্যাপ পাওয়া যায়নি।</span></div>`;
    return;
  }

  appsGrid.innerHTML = filtered.map(app => {
    const statusClass = app.isRunning ? 'active' : '';
    const statusText = app.isRunning ? 'Running' : 'Ready';

    let actionBtns = '';
    if (app.hasDesktop && app.hasBrowser) {
      actionBtns = `
        <button class="btn-launch btn-launch-desktop" title="ডেস্কটপ অ্যাপ খুলুন" onclick="launchAppAction('${app.id}','desktop',this)">
          <i class="fa-solid fa-desktop"></i><span>ডেস্কটপ</span>
        </button>
        <button class="btn-launch btn-launch-browser" title="ব্রাউজারে খুলুন" onclick="launchAppAction('${app.id}','browser',this)">
          <i class="fa-solid fa-globe"></i><span>ব্রাউজার</span>
        </button>`;
    } else if (app.hasDesktop) {
      actionBtns = `
        <button class="btn-launch btn-full-width" style="background: linear-gradient(135deg, #ef4444, #dc2626);" onclick="launchAppAction('${app.id}','desktop',this)">
          <i class="fa-solid fa-desktop"></i><span>ডেস্কটপ অ্যাপ</span>
        </button>`;
    } else {
      actionBtns = `
        <button class="btn-launch btn-full-width" onclick="launchAppAction('${app.id}','browser',this)">
          <i class="fa-solid fa-arrow-up-right-from-square"></i><span>ওপেন স্টুডিও</span>
        </button>`;
    }

    return `
      <div class="app-card">
        <div>
          <div class="app-card-header">
            <div class="app-identity">
              <div class="app-icon-wrap" style="color:${app.accentColor};">${app.icon}</div>
              <div class="app-titles">
                <h3>${app.name}</h3>
                <div class="bangla-subtitle">${app.banglaName || ''}</div>
              </div>
            </div>
            <span class="badge-tag" style="border-color:${app.accentColor}44; color:${app.accentColor};">${app.badge}</span>
          </div>
          <p class="app-desc" style="margin-top:14px;">${app.description}</p>
        </div>
        <div class="app-meta-row">
          <div class="status-badge">
            <span class="status-dot ${statusClass}"></span>
            <span>${statusText}</span>
          </div>
          <div class="app-card-actions">
            <button class="btn-open-folder" title="ফোল্ডার খুলুন" onclick="openAppFolder('${app.id}')">
              <i class="fa-solid fa-folder-open"></i>
            </button>
            ${actionBtns}
          </div>
        </div>
      </div>`;
  }).join('');
}

window.launchAppAction = async function(appId, mode, btn) {
  const app = allApps.find(a => a.id === appId);
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
  try {
    const res = await fetch(`/api/launch/${appId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Launch failed');
    showToast(data.message || 'চালু হয়েছে!', 'success');
    
    // If browser mode, open in browser tab immediately
    if (mode === 'browser' && data.webUrl) {
      window.open(data.webUrl, '_blank');
    }
    
    setTimeout(loadApps, 1500);
  } catch (err) {
    // Cloud / GitHub Pages Mode Handling
    if (mode === 'browser' && app && app.webUrl) {
      window.open(app.webUrl, '_blank');
      showToast(`${app.name} ওপেন করা হচ্ছে...`, 'info');
    } else if (mode === 'desktop') {
      showToast('এটি ডেস্কটপ অ্যাপ। এটি আপনার পিসির শর্টকাট দিয়ে চালান।', 'info');
    } else {
      showToast(`ত্রুটি: ${err.message}`, 'error');
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
  }
};

window.openAppFolder = async function(appId) {
  const app = allApps.find(a => a.id === appId);
  try {
    const res = await fetch(`/api/open-folder/${appId}`, { method: 'POST' });
    const data = await res.json();
    showToast(data.message || 'ফোল্ডার ওপেন হয়েছে।', 'info');
  } catch (err) {
    showToast('অনলাইন ক্লাউড মোডে সরাসরি লোকাল ফোল্ডার খোলা সম্ভব নয়।', 'info');
  }
};

// ==================== BOOKMARKS ====================
const CATEGORY_ICONS = {
  website: '🌐',
  wordpress: '📝',
  admin: '🔧',
  social: '📱',
  tool: '🛠️',
  finance: '💰',
  other: '📌'
};

const CATEGORY_LABELS = {
  website: 'ওয়েবসাইট',
  wordpress: 'WordPress',
  admin: 'Admin Panel',
  social: 'Social Media',
  tool: 'Dev Tool',
  finance: 'Finance',
  other: 'অন্যান্য'
};

function loadBookmarksFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('shakib_hub_bookmarks') || '[]');
  } catch (_) { return []; }
}

function saveBookmarksToStorage() {
  localStorage.setItem('shakib_hub_bookmarks', JSON.stringify(bookmarks));
  updateBookmarkCountBadge();
}

function updateBookmarkCountBadge() {
  if (bookmarks.length > 0) {
    bookmarkCountEl.textContent = bookmarks.length;
    bookmarkCountEl.style.display = 'inline';
  } else {
    bookmarkCountEl.style.display = 'none';
  }
}

function getFaviconUrl(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
  } catch (_) { return null; }
}

function renderBookmarks() {
  const q = bmSearchQuery.toLowerCase().trim();
  const filtered = bookmarks.filter(bm => {
    if (!q) return true;
    return bm.title.toLowerCase().includes(q) ||
      bm.url.toLowerCase().includes(q) ||
      (bm.note || '').toLowerCase().includes(q) ||
      (CATEGORY_LABELS[bm.category] || '').toLowerCase().includes(q);
  });

  if (!filtered.length) {
    bookmarksGrid.innerHTML = `
      <div class="empty-bookmarks">
        <i class="fa-solid fa-bookmark"></i>
        <span>${bookmarks.length ? 'কোনো বুকমার্ক খুঁজে পাওয়া যায়নি।' : 'কোনো বুকমার্ক নেই। উপরের বাটন দিয়ে যোগ করুন।'}</span>
      </div>`;
    return;
  }

  bookmarksGrid.innerHTML = filtered.map(bm => {
    const icon = CATEGORY_ICONS[bm.category] || '🔗';
    const faviconUrl = getFaviconUrl(bm.url);
    const faviconHtml = faviconUrl
      ? `<img src="${faviconUrl}" onerror="this.parentElement.innerHTML='${icon}'" />`
      : icon;
    const label = CATEGORY_LABELS[bm.category] || bm.category;

    return `
      <div class="bookmark-card" onclick="openBookmark('${bm.id}')">
        <div class="bookmark-favicon">${faviconHtml}</div>
        <div class="bookmark-info">
          <div class="bookmark-title">${escapeHtml(bm.title)}</div>
          <div class="bookmark-url">${escapeHtml(bm.url)}</div>
          ${bm.note ? `<div class="bookmark-category-dot">📝 ${escapeHtml(bm.note)}</div>` : ''}
        </div>
        <div class="bookmark-actions" onclick="event.stopPropagation();">
          <button class="bookmark-action-btn" title="সম্পাদনা" onclick="editBookmark('${bm.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="bookmark-action-btn delete" title="মুছুন" onclick="deleteBookmark('${bm.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <span class="bookmark-tag">${label}</span>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.openBookmark = function(id) {
  const bm = bookmarks.find(b => b.id === id);
  if (!bm) return;
  window.open(bm.url, '_blank');
};

window.editBookmark = function(id) {
  const bm = bookmarks.find(b => b.id === id);
  if (!bm) return;
  editingBookmarkId = id;
  document.getElementById('modalTitle').textContent = '✏️ বুকমার্ক সম্পাদনা করুন';
  document.getElementById('bmTitle').value = bm.title;
  document.getElementById('bmUrl').value = bm.url;
  document.getElementById('bmCategory').value = bm.category || 'website';
  document.getElementById('bmNote').value = bm.note || '';
  openModal();
};

window.deleteBookmark = function(id) {
  if (!confirm('এই বুকমার্কটি মুছে দিতে চান?')) return;
  bookmarks = bookmarks.filter(b => b.id !== id);
  saveBookmarksToStorage();
  renderBookmarks();
  showToast('বুকমার্ক মুছে ফেলা হয়েছে।', 'info');
};

function openModal() {
  bookmarkModal.classList.add('open');
  document.getElementById('bmTitle').focus();
}

function closeModal() {
  bookmarkModal.classList.remove('open');
  editingBookmarkId = null;
  document.getElementById('bmTitle').value = '';
  document.getElementById('bmUrl').value = '';
  document.getElementById('bmCategory').value = 'website';
  document.getElementById('bmNote').value = '';
  document.getElementById('modalTitle').textContent = '🔖 বুকমার্ক যুক্ত করুন';
}

document.getElementById('openAddBookmarkBtn').addEventListener('click', () => {
  editingBookmarkId = null;
  closeModal();
  openModal();
});

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);
bookmarkModal.addEventListener('click', (e) => { if (e.target === bookmarkModal) closeModal(); });

document.getElementById('saveBookmark').addEventListener('click', () => {
  const title = document.getElementById('bmTitle').value.trim();
  const url = document.getElementById('bmUrl').value.trim();
  const category = document.getElementById('bmCategory').value;
  const note = document.getElementById('bmNote').value.trim();

  if (!title) { showToast('শিরোনাম লিখুন।', 'error'); return; }
  if (!url) { showToast('URL দিন।', 'error'); return; }

  let finalUrl = url;
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }

  if (editingBookmarkId) {
    const idx = bookmarks.findIndex(b => b.id === editingBookmarkId);
    if (idx >= 0) {
      bookmarks[idx] = { ...bookmarks[idx], title, url: finalUrl, category, note };
    }
    showToast('বুকমার্ক আপডেট হয়েছে!', 'success');
  } else {
    bookmarks.push({
      id: Date.now().toString(),
      title,
      url: finalUrl,
      category,
      note,
      createdAt: new Date().toISOString()
    });
    showToast('বুকমার্ক সংরক্ষণ হয়েছে!', 'success');
  }

  saveBookmarksToStorage();
  renderBookmarks();
  closeModal();
});

// Bookmark search
if (bmSearchInput) {
  bmSearchInput.addEventListener('input', (e) => {
    bmSearchQuery = e.target.value;
    renderBookmarks();
  });
}

// ==================== NAV TABS ====================
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const section = tab.dataset.section;

    navTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (section === 'bookmarks') {
      showSection('bookmarks');
      appSearchInput.placeholder = 'বুকমার্ক খুঁজুন...';
    } else {
      showSection('apps');
      activeFilter = tab.dataset.filter || 'all';
      appSearchInput.placeholder = 'অ্যাপ বা প্রজেক্ট খুঁজুন...';
      renderApps();
    }
  });
});

// App search (also triggers bookmark search if on that section)
appSearchInput.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase().trim();
  if (activeSection === 'bookmarks') {
    bmSearchQuery = q;
    renderBookmarks();
  } else {
    appSearchQuery = q;
    renderApps();
  }
});

// Refresh button
refreshBtn.addEventListener('click', () => {
  const icon = refreshBtn.querySelector('i');
  icon.classList.add('fa-spin');
  loadApps().finally(() => setTimeout(() => icon.classList.remove('fa-spin'), 600));
});

// ==================== INIT ====================
updateBookmarkCountBadge();
loadApps();
setInterval(loadApps, 10000);
