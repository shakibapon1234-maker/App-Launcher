const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 4500;

function startServer(callback) {
  serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
    cwd: __dirname,
    stdio: 'ignore',
    windowsHide: true
  });

  setTimeout(callback, 800);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Shakib Studio Hub — Central Control',
    backgroundColor: '#0b0d13',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'logo.svg'),
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
