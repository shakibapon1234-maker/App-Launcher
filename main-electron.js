const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const net = require('net');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 4500;

function getNodeExecutable() {
  const result = spawnSync('where.exe', ['node.exe'], { encoding: 'utf8', windowsHide: true });
  const nodePath = (result.stdout || '').split(/\r?\n/).find(Boolean);
  return nodePath || 'node.exe';
}

function isServerAvailable(callback) {
  const probe = net.connect({ host: '127.0.0.1', port: SERVER_PORT });
  probe.once('connect', () => { probe.destroy(); callback(true); });
  probe.once('error', () => callback(false));
}

function waitForServer(callback, attempts = 20) {
  isServerAvailable((ready) => {
    if (ready || attempts <= 0) return callback();
    setTimeout(() => waitForServer(callback, attempts - 1), 250);
  });
}

function startServer(callback) {
  isServerAvailable((alreadyRunning) => {
    if (alreadyRunning) return callback();
    serverProcess = spawn(getNodeExecutable(), [path.join(__dirname, 'server.js')], {
    cwd: __dirname,
    stdio: 'ignore',
    windowsHide: true
    });

    serverProcess.on('error', () => {});
    waitForServer(callback);
  });
}

try {
  app.setAppUserModelId('com.shakib.studiohub');
} catch (_) {}

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Shakib Studio Hub — Central Control',
    backgroundColor: '#0b0d13',
    autoHideMenuBar: true,
    icon: fs.existsSync(iconPath) ? iconPath : path.join(__dirname, 'logo.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // CRITICAL: Any link or window.open MUST open in the user's actual default browser (Chrome/Edge), NOT as an Electron window!
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try { serverProcess.kill(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
