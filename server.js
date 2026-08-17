const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const PORT = 4500;
const runningProcesses = {};

// --- GLOBAL CRASH GUARDS ---
process.on('uncaughtException', (err) => {
  console.error('[Shakib Hub] Uncaught Exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Shakib Hub] Unhandled Rejection (server kept alive):', reason);
});

// Full Project Registry with Dual-Mode (Desktop & Browser) Support
const APPS = [
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
    path: path.resolve(__dirname, '../Warisha Fasion/photo and text editor/photo-and-text-editor'),
    launchCmd: 'start_desktop.bat',
    webPort: 4200,
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
    path: path.resolve(__dirname, '../Video-Editor'),
    launchCmd: 'start.bat',
    webPort: 4000,
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
    description: 'Professional desktop PDF studio: advanced page editing, offline conversion, watermark, e-sign, and OCR integration.',
    path: path.resolve(__dirname, '../../Antigravity-PDF-Pro-1'),
    launchCmd: 'RUN_APP.bat',
    webPort: 5173,
    webUrl: 'http://localhost:5173'
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
    path: path.resolve(__dirname, '../PDF-WEBSITE'),
    webPort: 3456,
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
    path: path.resolve(__dirname, '../Warisha Fasion/Warisha-Fashion'),
    webPort: 3500,
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
    path: path.resolve(__dirname, '../../wings-fly-clean'),
    webPort: 3600,
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
    path: path.resolve(__dirname, '../../Wings Fly Website/Wings-Fly-Public-Site'),
    webPort: 3700,
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
    path: path.resolve(__dirname, '../acade-flow'),
    webPort: 3780,
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
    path: path.resolve(__dirname, '../Wings-Fly-Foundation'),
    webPort: 3890,
    webUrl: 'http://localhost:3890/index.html'
  }
];

// Helper: static file server for a web app directory
const miniServers = {};
function ensureMiniServer(app) {
  if (miniServers[app.id]) return; // already running
  const srv = http.createServer((req, res) => {
    let reqUrl = decodeURI(req.url.split('?')[0]);
    if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';
    const filePath = path.join(app.path, reqUrl);

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const mimeMap = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4',
        '.pdf': 'application/pdf',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
      };
      res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
      const stream = fs.createReadStream(filePath);
      stream.on('error', (streamErr) => {
        console.error('[Shakib Hub] Stream error:', streamErr.message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('Internal error reading file.');
      });
      stream.pipe(res);
    });
  });

  // If port already in use (e.g. video editor already running), just mark and move on
  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Shakib Hub] Port ${app.webPort} already in use for ${app.name} — using existing server.`);
      miniServers[app.id] = true; // mark as handled so we don't retry
    } else {
      console.error(`[Shakib Hub] Server error for ${app.name}:`, err.message);
    }
  });

  srv.listen(app.webPort, () => {
    console.log(`[Shakib Studio Hub] Serving ${app.name} at http://localhost:${app.webPort}`);
  });
  miniServers[app.id] = srv;
}

// Launch application (Desktop Mode vs Browser Mode)
function launchApp(appId, mode, callback) {
  const app = APPS.find(a => a.id === appId);
  if (!app) return callback(new Error('App not found'));

  const isDesktop = mode === 'desktop' && app.hasDesktop;

  if (isDesktop) {
    const batPath = path.join(app.path, app.launchCmd);
    if (fs.existsSync(batPath)) {
      try {
        const child = spawn('cmd.exe', ['/c', 'start', '""', app.launchCmd], {
          cwd: app.path,
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        runningProcesses[appId] = true;
        return callback(null, { 
          success: true, 
          mode: 'desktop',
          message: `${app.name} (ডেস্কটপ মোড) চালু হচ্ছে...` 
        });
      } catch (err) {
        console.error(`[Shakib Hub] Desktop spawn error for ${app.name}:`, err.message);
      }
    } else {
      console.warn(`[Shakib Hub] .bat not found at: ${batPath}`);
    }
  }

  // Browser mode: ensure mini-server running and return webUrl
  ensureMiniServer(app);
  runningProcesses[appId] = true;
  return callback(null, { 
    success: true, 
    mode: 'browser',
    webUrl: app.webUrl,
    message: `${app.name} ব্রাউজারে খোলা হচ্ছে...` 
  });
}

// Open folder in Windows Explorer
function openFolder(appId, callback) {
  const app = APPS.find(a => a.id === appId);
  if (!app) return callback(new Error('App not found'));
  
  try {
    const child = spawn('explorer.exe', [app.path], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return callback(null, { success: true, message: `${app.name} ফোল্ডার খোলা হয়েছে।` });
  } catch (err) {
    console.error('[Shakib Hub] Folder open error:', err.message);
    return callback(err);
  }
}

// Main Hub Server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/apps' && req.method === 'GET') {
    const appList = APPS.map(a => ({
      ...a,
      isRunning: !!runningProcesses[a.id]
    }));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(appList));
    return;
  }

  if (pathname.startsWith('/api/launch/') && req.method === 'POST') {
    const appId = pathname.replace('/api/launch/', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let mode = 'desktop';
      try {
        if (body) {
          const parsed = JSON.parse(body);
          if (parsed.mode) mode = parsed.mode;
        }
      } catch (_) {}

      launchApp(appId, mode, (err, result) => {
        if (err) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: err.message }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result));
        }
      });
    });
    return;
  }

  if (pathname.startsWith('/api/open-folder/') && req.method === 'POST') {
    const appId = pathname.replace('/api/open-folder/', '');
    openFolder(appId, (err, result) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      }
    });
    return;
  }

  // Static Frontend Files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  fs.stat(filePath, (err, stat) => {
    const finalPath = (err || !stat.isFile()) ? path.join(__dirname, 'index.html') : filePath;
    const ext = path.extname(finalPath).toLowerCase();
    const mimeMap = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/html' });
    const stream = fs.createReadStream(finalPath);
    stream.on('error', (se) => {
      console.error('[Shakib Hub] Static file error:', se.message);
      if (!res.headersSent) res.writeHead(500);
      res.end('Error serving file.');
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`       🚀 Shakib Studio Hub is running!                `);
  console.log(`       URL: http://localhost:${PORT}                   `);
  console.log(`=======================================================`);
});
