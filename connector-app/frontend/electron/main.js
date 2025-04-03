const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

app.commandLine.appendSwitch('ignore-certificate-errors');
app.disableHardwareAcceleration();

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

  const indexPath = path.join(__dirname, '../build/index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.webContents.openDevTools(); // Optional
}

// ✅ Use BAT to launch backend on Windows
function startBackend() {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const batPath = path.join(__dirname, '../start.bat');

    backendProcess = spawn('cmd.exe', ['/c', batPath], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      detached: false,
      stdio: 'inherit',
    });

    console.log('🚀 Backend started via start.bat');
  } else {
    // In dev on Linux, run server.js directly
    const backendPath = path.join(__dirname, '../../backend/server.js');
    backendProcess = spawn('node', [backendPath], {
      cwd: path.join(__dirname, '../../backend'),
      shell: true,
      detached: false,
      stdio: 'inherit',
    });

    console.log('🚀 Backend server started on Linux/macOS (dev mode).');
  }
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    console.log('🛑 Backend server stopped.');
  }
}

// ✅ App ready
app.whenReady().then(() => {
  startBackend();
  createWindow();
});

// ✅ Clean up
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
