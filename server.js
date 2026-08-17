const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const { exec, spawn } = require('child_process');

const PORT = 4500;
const runningProcesses = {};
const miniServers = {};

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

process.on('uncaughtException', (err) => console.error('[Shakib Hub] Uncaught Exception:', err.message));
process.on('unhandledRejection', (reason) => console.error('[Shakib Hub] Unhandled Rejection:', reason));

function findProjectFolder(candidateNames, launchCmdCandidates) {
  const userHome = os.homedir();
  const searchRoots = [
    'D:\\Main Branch\\app helper',
    'D:\\Main Branch\\app helper\\Warisha Fasion',
    'D:\\Main Branch\\app helper\\Warisha Fasion\\photo and text editor',
    'D:\\Main Branch\\app helper\\Video-Editor',
    'D:\\Main Branch\\Wings Fly Website',
    'D:\\Main Branch',
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '../..'),
    path.resolve(__dirname, '../../..'),
    __dirname,
    path.join(userHome, 'Desktop'),
    path.join(userHome, 'Documents'),
    path.join(userHome, 'Downloads'),
    'C:\\Main Branch\\app helper',
    'C:\\Main Branch',
    'C:\\Projects',
    'D:\\Projects',
    'E:\\Projects'
  ];

  for (const root of searchRoots) {
    if (!fs.existsSync(root)) continue;
    try {
      const entries = fs.readdirSync(root);
      for (const cand of candidateNames) {
        const match = entries.find(e => 
          e.toLowerCase().replace(/[-_ ]/g, '') === cand.toLowerCase().replace(/[-_ ]/g, '')
        );
        if (match) {
          const fullPath = path.join(root, match);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            if (launchCmdCandidates) {
              for (const cmd of launchCmdCandidates) {
                if (fs.existsSync(path.join(fullPath, cmd))) return fullPath;
              }
            }
            if (fs.existsSync(path.join(fullPath, 'index.html')) || fs.existsSync(path.join(fullPath, 'website', 'index.html'))) {
              return fullPath;
            }

            try {
              const subEntries = fs.readdirSync(fullPath);
              for (const sub of subEntries) {
                const subPath = path.join(fullPath, sub);
                if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
                  if (launchCmdCandidates) {
                    for (const cmd of launchCmdCandidates) {
                      if (fs.existsSync(path.join(subPath, cmd))) return subPath;
                    }
                  }
                  if (fs.existsSync(path.join(subPath, 'index.html')) || fs.existsSync(path.join(subPath, 'website', 'index.html'))) {
                    return subPath;
                  }
                }
              }
            } catch (_) {}
            return fullPath;
          }
        }
      }
    } catch (_) {}
  }
  return null;
}

const APP_DEFINITIONS = [
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
    folderCandidates: ['Video-Editor', 'video-editor', 'video_editor', 'VideoEditor', 'video-editor-studio'],
    // start-video-editor.bat is a browser/server launcher.  The hub's Desktop
    // button must use the Electron launcher instead.
    launchCmdCandidates: ['start.bat'],
    webPort: 4000,
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
    folderCandidates: ['photo-and-text-editor', 'photo and text editor', 'photo-studio', 'PhotoStudio'],
    launchCmdCandidates: ['start_desktop.bat', 'start.bat', 'start_3d_text_studio.bat'],
    webPort: 4200,
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
    folderCandidates: ['Antigravity-PDF-Pro-1', 'antigravity-pdf-pro', 'PDF-Pro', 'AntigravityPDFPro'],
    // Use the packaged desktop application.  The development launchers can
    // open the development/licensing flow instead of the normal offline app.
    launchCmdCandidates: ['RUN_APP.bat'],
    webPort: 3000,
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
    folderCandidates: ['PDF-WEBSITE', 'pdf-website', 'PDF_WEBSITE', 'PDFWebsite'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3456,
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
    folderCandidates: ['Warisha-Fashion', 'Warisha Fasion', 'warisha-fashion', 'WarishaFashion'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3500,
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
    folderCandidates: ['Wings-Fly-Academy-1', 'wings-fly-clean', 'wings-fly-academy', 'WingsFlyAcademy'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3600,
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
    folderCandidates: ['Wings-Fly-Public-Site', 'Wings Fly Website', 'Wings-Fly-Public-Website', 'WingsFlyPublicSite'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3700,
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
    folderCandidates: ['acade-flow', 'acadeflow', 'Acade-Flow', 'AcadeFlow'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3780,
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
    folderCandidates: ['Wings-Fly-1-helper', 'wings-fly-1-helper', 'Wings-Fly-Helper', 'WingsFlyHelper'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3990,
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
    folderCandidates: ['Wings-Fly-Foundation', 'wings-fly-foundation', 'WingsFlyFoundation'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat'],
    webPort: 3890,
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
    folderCandidates: ['Voice-Typing', 'voice-typing', 'VoiceTyping'],
    launchCmdCandidates: ['start.bat', 'start_desktop.bat', 'run_video_to_text.bat'],
    webPort: 3950,
    webUrl: 'https://shakibapon1234-maker.github.io/Voice-Typing/',
    localUrl: 'http://localhost:3950/index.html'
  }
];

function ensureMiniServer(app) {
  if (!app.webPort || miniServers[app.id]) return;
  if (!app.path || !fs.existsSync(app.path)) return;

  const srv = http.createServer((req, res) => {
    let reqUrl = '/index.html';
    try {
      reqUrl = decodeURIComponent(req.url.split('?')[0]);
    } catch (_) {
      reqUrl = req.url.split('?')[0];
    }
    if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';

    const candidatePaths = [
      path.join(app.path, reqUrl),
      path.join(app.path, 'website', reqUrl),
      path.join(app.path, 'Warisha-Fashion', reqUrl),
      path.join(app.path, 'Wings-Fly-Public-Site', reqUrl),
      path.join(app.path, 'photo-and-text-editor', reqUrl)
    ];

    if (reqUrl === '/' || reqUrl === '/index.html') {
      candidatePaths.push(path.join(app.path, 'index.html'));
      candidatePaths.push(path.join(app.path, 'website', 'index.html'));
      candidatePaths.push(path.join(app.path, 'Warisha-Fashion', 'index.html'));
      candidatePaths.push(path.join(app.path, 'Wings-Fly-Public-Site', 'index.html'));
    }

    let finalFile = null;
    for (const cand of candidatePaths) {
      try {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          finalFile = cand;
          break;
        }
      } catch (_) {}
    }

    if (!finalFile) {
      res.writeHead(404, { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end('File not found');
    }

    const ext = path.extname(finalFile).toLowerCase();
    res.writeHead(200, { 
      'Content-Type': MIME_MAP[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    const stream = fs.createReadStream(finalFile);
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    stream.pipe(res);
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Shakib Hub] Port ${app.webPort} already active for ${app.name}`);
      miniServers[app.id] = true;
    } else {
      console.error(`[Shakib Hub] Mini server error for ${app.name}:`, err.message);
    }
  });

  try {
    srv.listen(app.webPort, '0.0.0.0', () => {
      console.log(`[Shakib Hub] Mini server active for ${app.name} on port ${app.webPort}`);
    });
    miniServers[app.id] = srv;
  } catch (err) {
    console.error(`[Shakib Hub] Listen error for ${app.name}:`, err.message);
  }
}

function getResolvedApps() {
  return APP_DEFINITIONS.map(app => {
    const resolvedPath = app.folderCandidates ? findProjectFolder(app.folderCandidates, app.launchCmdCandidates) : null;
    let resolvedBat = null;

    if (resolvedPath && app.launchCmdCandidates) {
      for (const cmd of app.launchCmdCandidates) {
        const p = path.join(resolvedPath, cmd);
        if (fs.existsSync(p)) {
          resolvedBat = cmd;
          break;
        }
      }
    }

    return {
      ...app,
      path: resolvedPath,
      launchCmd: resolvedBat,
      isInstalledLocally: !!resolvedPath,
      isRunning: !!runningProcesses[app.id]
    };
  });
}

function checkPortInUse(port) {
  return new Promise((resolve) => {
    if (!port) return resolve(false);
    const socket = new net.Socket();
    socket.setTimeout(250);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    try {
      socket.connect(port, '127.0.0.1');
    } catch (_) {
      resolve(false);
    }
  });
}

async function getResolvedAppsWithStatus() {
  const apps = getResolvedApps();
  const list = await Promise.all(
    apps.map(async (app) => {
      const portLive = app.webPort ? await checkPortInUse(app.webPort) : false;
      return {
        ...app,
        isRunning: !!(runningProcesses[app.id] || portLive)
      };
    })
  );
  return list;
}

function launchApp(appId, mode, callback) {
  const apps = getResolvedApps();
  const app = apps.find(a => a.id === appId);
  if (!app) return callback(new Error('App not found'));

  const isDesktop = mode === 'desktop';

  if (isDesktop && app.path && app.launchCmd) {
    try {
      // Prevent development tooling from forcing launched Electron apps to run
      // as Node.js instead of opening their desktop windows.
      const launchEnv = { ...process.env };
      delete launchEnv.ELECTRON_RUN_AS_NODE;
      const child = spawn('cmd.exe', ['/c', 'start', '""', app.launchCmd], {
        cwd: app.path,
        detached: true,
        stdio: 'ignore',
        env: launchEnv
      });
      child.unref();
      runningProcesses[appId] = true;
      return callback(null, { 
        success: true, 
        mode: 'desktop',
        message: `${app.name} ডেস্কটপে চালু হয়েছে!` 
      });
    } catch (err) {
      console.error(`[Shakib Hub] Launch error:`, err.message);
      return callback(new Error(`চালু করতে ব্যর্থ: ${err.message}`));
    }
  }

  if (isDesktop && !app.path) {
    return callback(new Error(`এই পিসিতে ${app.name} প্রজেক্ট ফোল্ডারটি পাওয়া যায়নি।`));
  }

  // Browser mode:
  if (app.path && app.webPort) {
    ensureMiniServer(app);
    runningProcesses[appId] = true;
    return callback(null, { 
      success: true, 
      mode: 'browser',
      webUrl: app.localUrl || `http://localhost:${app.webPort}/index.html`,
      message: `${app.name} ওপেন হচ্ছে...` 
    });
  }

  return callback(null, { 
    success: true, 
    mode: 'browser',
    webUrl: app.webUrl,
    message: `${app.name} ওপেন হচ্ছে...` 
  });
}

function openFolder(appId, callback) {
  const apps = getResolvedApps();
  const app = apps.find(a => a.id === appId);
  if (!app || !app.path || !fs.existsSync(app.path)) {
    return callback(new Error(`এই পিসির ড্রাইভে ${app ? app.name : 'প্রজেক্ট'} ফোল্ডারটি পাওয়া যায়নি`));
  }

  try {
    const child = spawn('explorer.exe', [app.path], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return callback(null, { success: true, message: `${app.name} ফোল্ডার ওপেন হয়েছে` });
  } catch (err) {
    return callback(err);
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/apps' && req.method === 'GET') {
    getResolvedAppsWithStatus().then(list => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(list));
    }).catch(() => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(getResolvedApps()));
    });
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

  let reqUrl = '/index.html';
  try {
    reqUrl = decodeURIComponent(pathname);
  } catch (_) {
    reqUrl = pathname;
  }
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';

  let filePath = path.join(__dirname, reqUrl);
  let finalPath = path.join(__dirname, 'index.html');
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      finalPath = filePath;
    }
  } catch (_) {}

  const ext = path.extname(finalPath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_MAP[ext] || 'text/html' });
  const stream = fs.createReadStream(finalPath);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500);
    res.end('Error serving file.');
  });
  stream.pipe(res);
});

// Auto start mini static servers for all local apps
function autoStartMiniServers() {
  const apps = getResolvedApps();
  apps.forEach(app => {
    // Start for all apps that have a local path and a web port (browser mode needs it)
    if (app.path && app.webPort) {
      ensureMiniServer(app);
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[Shakib Hub] Main port ${PORT} is already in use.`);
  } else {
    console.error('[Shakib Hub] Main server error:', err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`       🚀 Shakib Studio Hub is running!               `);
  console.log(`       URL: http://localhost:${PORT}                  `);
  console.log(`=======================================================`);
  autoStartMiniServers();
});

// Keep process event loop alive permanently
setInterval(() => {}, 1000 * 60 * 60);
