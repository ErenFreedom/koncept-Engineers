const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

// ✅ Function to create main window
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

  const indexPath = path.join(__dirname, '../frontend/build/index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.webContents.openDevTools(); // ❗ Remove in production

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ✅ Start Docker backend
function startDockerBackend() {
  const isWin = process.platform === 'win32';
  const scriptName = isWin ? 'start.bat' : 'start.sh';

  // In production, use the unpacked resource path
  const scriptPath = app.isPackaged
    ? path.join(process.resourcesPath, scriptName)
    : path.join(__dirname, '..', scriptName);

  const backendProcess = spawn(scriptPath, [], {
    cwd: path.dirname(scriptPath),
    shell: true,
    stdio: 'inherit',
  });

  backendProcess.on('error', (err) => {
    console.error("❌ Failed to launch Docker backend:", err);
  });

  backendProcess.on('exit', (code) => {
    console.log(`⚠️ Docker backend process exited with code ${code}`);
  });
}


// 🛡 Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    startDockerBackend(); // 🐳 Launch Dockerized backend
    createWindow();       // 🖥️ Load frontend
  });

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
