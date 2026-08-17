// ==================== ENVIRONMENT ====================
const isLocalServer = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.port === '4500' ||
  window.location.hostname.includes('192.168') ||
  window.location.hostname.includes('10.0');

console.log('[Shakib Hub] Environment:', { hostname: window.location.hostname, port: window.location.port, isLocalServer });

// Update footer mode text
document.addEventListener('DOMContentLoaded', () => {
  const modeEl = document.getElementById('hubModeText');
  if (modeEl) {
    modeEl.textContent = isLocalServer 
      ? `Shakib Studio Hub — Local Server (${window.location.host})` 
      : 'Shakib Studio Hub — GitHub Cloud Live';
  }
});

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
const runningStatusPill = document.getElementById('runningStatusPill');
const runningStatusText = document.getElementById('runningStatusText');
const runningNavCount = document.getElementById('runningNavCount');

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'info') {
  if (!toastContainer) return;
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
    if (appsGrid) appsGrid.style.display = 'none';
    if (bookmarksPanel) bookmarksPanel.classList.add('active');
    renderBookmarks();
  } else {
    if (appsGrid) appsGrid.style.display = '';
    if (bookmarksPanel) bookmarksPanel.classList.remove('active');
  }
}

// ==================== 100% GITHUB CLOUD APPS REGISTRY ====================
const DEFAULT_APPS_FALLBACK = [
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
    webUrl: 'https://shakibapon1234-maker.github.io/Video-Editor/',
    localUrl: 'http://localhost:4000'
  },
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
    webUrl: 'https://shakibapon1234-maker.github.io/photo-and-text-editor/',
    localUrl: 'http://localhost:4200/index.html'
  },
  {
    id: 'pdf-desktop',
    name: 'Antigravity PDF Pro',
    banglaName: 'অ্যান্টিগ্র্যাভিটি পিডিএফ প্রো',
    hasDesktop: true,
    hasBrowser: true,
    badge: 'Web & Desktop',
    category: 'document',
    icon: '📑',
    accentColor: '#ef4444',
    description: 'Professional desktop PDF studio: advanced page editing, offline conversion, watermark, e-sign, and OCR integration.',
    webUrl: 'https://shakibapon1234-maker.github.io/Antigravity-PDF-Pro-1/',
    localUrl: 'http://localhost:3000'
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
    webUrl: 'https://shakibapon1234-maker.github.io/PDF-WEBSITE/',
    localUrl: 'http://localhost:3456/index.html'
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
    webUrl: 'https://shakibapon1234-maker.github.io/Warisha-Fashion/',
    localUrl: 'http://localhost:3500/index.html'
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
    webUrl: 'https://shakibapon1234-maker.github.io/Wings-Fly-Academy-1/',
    localUrl: 'http://localhost:3600/index.html'
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
    webUrl: 'https://shakibapon1234-maker.github.io/Wings-Fly-Public-Site/',
    localUrl: 'http://localhost:3700/index.html'
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
    webUrl: 'https://shakibapon1234-maker.github.io/acade-flow/',
    localUrl: 'http://localhost:3780/index.html'
  },
  {
    id: 'wings-fly-helper',
    name: 'Wings Fly 1 Helper',
    banglaName: 'উইংস ফ্লাই ১ হেল্পার ও টুলবক্স',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Tools & Files',
    category: 'creative',
    icon: '🛠️',
    accentColor: '#6366f1',
    description: 'Essential developer tools, credential manager, credentials vault, voice tools, and reusable project assets.',
    webUrl: 'https://github.com/shakibapon1234-maker/Wings-Fly-1-helper',
    localUrl: 'http://localhost:3990/website/index.html'
  },
  {
    id: 'wings-fly-foundation',
    name: 'Wings Fly Foundation',
    banglaName: 'উইংস ফ্লাই ফাউন্ডেশন',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'Ledger & Accounts',
    category: 'finance',
    icon: '🤝',
    accentColor: '#8b5cf6',
    description: 'Client ledger management, charitable accounts, donor records, and transparent financial reporting system.',
    webUrl: 'https://shakibapon1234-maker.github.io/Wings-Fly-Foundation/',
    localUrl: 'http://localhost:3890/index.html'
  },
  {
    id: 'voice-typing',
    name: 'AI Voice Typing',
    banglaName: 'এআই ভয়েস টাইপিং',
    hasDesktop: false,
    hasBrowser: true,
    badge: 'AI Studio',
    category: 'creative',
    icon: '🎙️',
    accentColor: '#f97316',
    description: 'High-speed automated speech-to-text and AI Bangla speech transcription engine.',
    webUrl: 'https://shakibapon1234-maker.github.io/Voice-Typing/',
    localUrl: 'http://localhost:3950/index.html'
  }
];

function updateRunningAppsCount() {
  const runningApps = allApps.filter(a => !!a.isRunning);
  const count = runningApps.length;

  if (runningStatusText) {
    runningStatusText.textContent = `${count} টি অ্যাপ রানিং`;
  }
  if (runningNavCount) {
    if (count > 0) {
      runningNavCount.textContent = count;
      runningNavCount.style.display = 'inline';
    } else {
      runningNavCount.style.display = 'none';
    }
  }
}

window.filterRunningApps = function() {
  showSection('apps');
  activeFilter = 'running';
  navTabs.forEach(t => {
    t.classList.toggle('active', t.dataset.filter === 'running');
  });
  renderApps();
};

// ==================== APPS LOADER ====================
async function loadApps() {
  if (isLocalServer) {
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const apiApps = await res.json();
        allApps = DEFAULT_APPS_FALLBACK.map(def => {
          const live = apiApps.find(a => a.id === def.id);
          return live ? { ...def, ...live } : def;
        });
      } else {
        allApps = DEFAULT_APPS_FALLBACK;
      }
    } catch (_) {
      allApps = DEFAULT_APPS_FALLBACK;
    }
  } else {
    // Cloud / GitHub Pages Mode
    allApps = DEFAULT_APPS_FALLBACK;
  }
  updateRunningAppsCount();
  if (activeSection === 'apps') renderApps();
}

function renderApps() {
  if (!appsGrid) return;
  const filtered = allApps.filter(app => {
    let matchCat = false;
    if (activeFilter === 'all') {
      matchCat = true;
    } else if (activeFilter === 'running') {
      matchCat = !!app.isRunning;
    } else {
      matchCat = app.category === activeFilter;
    }

    const q = appSearchQuery.toLowerCase().trim();
    const matchSearch = !q || app.name.toLowerCase().includes(q) ||
      (app.banglaName || '').toLowerCase().includes(q) ||
      (app.description || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (!filtered.length) {
    const emptyMsg = activeFilter === 'running' 
      ? 'বর্তমানে কোনো অ্যাপ রানিং নেই'
      : 'কোনো অ্যাপ পাওয়া যায়নি';
    appsGrid.innerHTML = `<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;"><i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 12px;"></i><br><span>${emptyMsg}</span></div>`;
    return;
  }

  appsGrid.innerHTML = filtered.map(app => {
    const statusClass = app.isRunning ? 'active' : '';
    const statusText = app.isRunning ? 'Running' : 'Ready';

    let actionBtns = '';

    if (isLocalServer) {
      // Local Server mode: interactive buttons with local API hooks
      if (app.hasDesktop && app.hasBrowser) {
        actionBtns = `
          <button class="btn-launch btn-launch-desktop" title="ডেস্কটপ অ্যাপ ওপেন করুন" onclick="launchAppAction('${app.id}','desktop',this)">
            <i class="fa-solid fa-desktop"></i><span>ডেস্কটপ</span>
          </button>
          <button class="btn-launch btn-launch-browser" title="ব্রাউজারে ওপেন করুন" onclick="launchAppAction('${app.id}','browser',this)">
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
    } else {
      // Cloud / GitHub Pages mode: 100% Reliable Direct Anchor Links (Zero Popup Blockers!)
      if (app.hasDesktop && app.hasBrowser) {
        actionBtns = `
          <a href="${app.webUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch btn-launch-desktop" title="অ্যাপ ওপেন করুন">
            <i class="fa-solid fa-desktop"></i><span>ডেস্কটপ</span>
          </a>
          <a href="${app.webUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch btn-launch-browser" title="ব্রাউজারে ওপেন করুন">
            <i class="fa-solid fa-globe"></i><span>ব্রাউজার</span>
          </a>`;
      } else if (app.hasDesktop) {
        actionBtns = `
          <a href="${app.webUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch btn-full-width" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
            <i class="fa-solid fa-desktop"></i><span>ওপেন স্টুডিও</span>
          </a>`;
      } else {
        actionBtns = `
          <a href="${app.webUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch btn-full-width">
            <i class="fa-solid fa-arrow-up-right-from-square"></i><span>ওপেন স্টুডিও</span>
          </a>`;
      }
    }

    const folderBtn = isLocalServer ? `
      <button class="btn-open-folder" title="লোকাল ফোল্ডার খুলুন" onclick="openAppFolder('${app.id}')">
        <i class="fa-solid fa-folder-open"></i>
      </button>` : `
      <a href="${app.webUrl}" target="_blank" rel="noopener noreferrer" class="btn-open-folder" title="প্রজেক্ট লিঙ্ক ওপেন করুন" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>`;

    return `
      <div class="app-card" style="--accent-color: ${app.accentColor || '#38bdf8'}">
        <div>
          <div class="app-card-header">
            <div class="app-identity">
              <div class="app-icon-wrap" style="color:${app.accentColor}; font-size: 1.6rem;">${app.icon}</div>
              <div class="app-titles">
                <h3>${app.name}</h3>
                <div class="bangla-subtitle">${app.banglaName || ''}</div>
              </div>
            </div>
            <span class="badge-tag" style="border-color:${app.accentColor}44; color:${app.accentColor};">${app.badge}</span>
          </div>
          <p class="app-desc" style="margin-top:14px;">${app.description || ''}</p>
        </div>
        <div class="app-meta-row">
          <div class="status-badge">
            <span class="status-dot ${statusClass}"></span>
            <span>${statusText}</span>
          </div>
          <div class="app-card-actions">
            ${folderBtn}
            ${actionBtns}
          </div>
        </div>
      </div>`;
  }).join('');
}

// Local server action handler
window.launchAppAction = async function(appId, mode, btn) {
  const app = allApps.find(a => a.id === appId);
  if (!app) return;
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
    if (!res.ok) {
      showToast(data.error || 'চালু করতে সমস্যা হয়েছে', 'error');
      return;
    }
    showToast(data.message || 'চালু হচ্ছে...', 'success');
    if (mode === 'browser') {
      window.open(data.webUrl || app.webUrl, '_blank');
    }
    setTimeout(loadApps, 1500);
  } catch (err) {
    if (mode === 'browser') {
      window.open(app.webUrl, '_blank');
      showToast(`${app.name} ওপেন হচ্ছে...`, 'info');
    } else {
      showToast('ডেস্কটপ অ্যাপ চালু করা যায়নি', 'error');
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
    if (!res.ok) {
      showToast(data.error || 'ফোল্ডার পাওয়া যায়নি', 'error');
      return;
    }
    showToast(data.message || 'ফোল্ডার ওপেন হয়েছে', 'success');
  } catch (err) {
    showToast('সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি', 'error');
  }
};

// ==================== BOOKMARKS ====================
const CATEGORY_ICONS = {
  website: '🌐',
  wordpress: '📝',
  admin: '⚡',
  social: '💬',
  tool: '🛠️',
  finance: '💰',
  other: '📁'
};

const CATEGORY_LABELS = {
  website: 'ওয়েবসাইট',
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
  if (!bookmarkCountEl) return;
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
  if (!bookmarksGrid) return;
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
      <div class="empty-bookmarks" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;"><i class="fa-solid fa-bookmark" style="font-size: 2.5rem; margin-bottom: 12px;"></i><br><span>${bookmarks.length ? 'খোঁজা বুকমার্কটি পাওয়া যায়নি' : 'এখনো কোনো বুকমার্ক যুক্ত করা হয়নি'}</span></div>`;
    return;
  }

  bookmarksGrid.innerHTML = filtered.map(bm => {
    const icon = CATEGORY_ICONS[bm.category] || '📁';
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
          <button class="bookmark-action-btn" title="এডিট করুন" onclick="editBookmark('${bm.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="bookmark-action-btn delete" title="মুছে ফেলুন" onclick="deleteBookmark('${bm.id}')">
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
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-bookmark"></i> বুকমার্ক পরিবর্তন করুন';
  document.getElementById('bmTitle').value = bm.title;
  document.getElementById('bmUrl').value = bm.url;
  document.getElementById('bmCategory').value = bm.category || 'website';
  document.getElementById('bmNote').value = bm.note || '';
  openModal();
};

window.deleteBookmark = function(id) {
  if (!confirm('এই বুকমার্কটি মুছে ফেলতে চান?')) return;
  bookmarks = bookmarks.filter(b => b.id !== id);
  saveBookmarksToStorage();
  renderBookmarks();
  showToast('বুকমার্ক মুছে ফেলা হয়েছে', 'info');
};

function openModal() {
  if (bookmarkModal) {
    bookmarkModal.classList.add('open');
    document.getElementById('bmTitle').focus();
  }
}

function closeModal() {
  if (bookmarkModal) {
    bookmarkModal.classList.remove('open');
    editingBookmarkId = null;
    document.getElementById('bmTitle').value = '';
    document.getElementById('bmUrl').value = '';
    document.getElementById('bmCategory').value = 'website';
    document.getElementById('bmNote').value = '';
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.innerHTML = '<i class="fa-solid fa-bookmark"></i> নতুন বুকমার্ক যুক্ত করুন';
  }
}

const openAddBookmarkBtn = document.getElementById('openAddBookmarkBtn');
if (openAddBookmarkBtn) {
  openAddBookmarkBtn.addEventListener('click', () => {
    editingBookmarkId = null;
    closeModal();
    openModal();
  });
}

const closeModalBtn = document.getElementById('closeModal');
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

const cancelModalBtn = document.getElementById('cancelModal');
if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

if (bookmarkModal) {
  bookmarkModal.addEventListener('click', (e) => { if (e.target === bookmarkModal) closeModal(); });
}

const saveBookmarkBtn = document.getElementById('saveBookmark');
if (saveBookmarkBtn) {
  saveBookmarkBtn.addEventListener('click', () => {
    const title = document.getElementById('bmTitle').value.trim();
    const url = document.getElementById('bmUrl').value.trim();
    const category = document.getElementById('bmCategory').value;
    const note = document.getElementById('bmNote').value.trim();

    if (!title) { showToast('একটি নাম লিখুন', 'error'); return; }
    if (!url) { showToast('URL প্রবেশ করুন', 'error'); return; }

    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    if (editingBookmarkId) {
      const idx = bookmarks.findIndex(b => b.id === editingBookmarkId);
      if (idx >= 0) {
        bookmarks[idx] = { ...bookmarks[idx], title, url: finalUrl, category, note };
      }
      showToast('বুকমার্ক আপডেট হয়েছে!', 'success');
    } else {
      bookmarks.push({
        id: Date.now().toString(),
        title,
        url: finalUrl,
        category,
        note,
        createdAt: new Date().toISOString()
      });
      showToast('বুকমার্ক যুক্ত হয়েছে!', 'success');
    }

    saveBookmarksToStorage();
    renderBookmarks();
    closeModal();
  });
}

if (bmSearchInput) {
  bmSearchInput.addEventListener('input', (e) => {
    bmSearchQuery = e.target.value;
    renderBookmarks();
  });
}

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const section = tab.dataset.section;
    navTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (section === 'bookmarks') {
      showSection('bookmarks');
      if (appSearchInput) appSearchInput.placeholder = 'বুকমার্ক খুঁজুন...';
    } else {
      showSection('apps');
      activeFilter = tab.dataset.filter || 'all';
      if (appSearchInput) appSearchInput.placeholder = 'অ্যাপ বা বুকমার্ক খুঁজুন...';
      renderApps();
    }
  });
});

if (appSearchInput) {
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
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    const icon = refreshBtn.querySelector('i');
    if (icon) icon.classList.add('fa-spin');
    loadApps().finally(() => {
      if (icon) setTimeout(() => icon.classList.remove('fa-spin'), 600);
      showToast('সব তথ্য রিফ্রেশ করা হয়েছে!', 'success');
    });
  });
}

// ==================== INITIALIZE ====================
updateBookmarkCountBadge();
loadApps();
if (isLocalServer) {
  setInterval(loadApps, 4000);
}
