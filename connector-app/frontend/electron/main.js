const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

app.commandLine.appendSwitch('ignore-certificate-errors');
app.disableHardwareAcceleration();

// 🟢 Detect dev mode
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const indexPath = isDev
    ? 'http://localhost:3000'
    : path.join(__dirname, '..', 'build', 'index.html');

  if (isDev) {
    mainWindow.loadURL(indexPath);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(indexPath);
  }

  console.log('✅ Electron window created');
}

function startBackend() {
  const isWindows = process.platform === 'win32';

  const backendPath = isDev
    ? path.join(__dirname, '../../backend/server.js')
    : path.join(__dirname, '..', 'backend', 'server.js');

  const backendCWD = isDev
    ? path.join(__dirname, '../../backend')
    : path.join(__dirname, '..', 'backend');

  backendProcess = spawn(process.execPath, [backendPath], {
    cwd: backendCWD,
    detached: false,
    shell: true,
    stdio: 'inherit',
  });

  console.log(`🚀 Backend server started (dev: ${isDev})`);
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    console.log('🛑 Backend server stopped.');
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  stopBackend();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
