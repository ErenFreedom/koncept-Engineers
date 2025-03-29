const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('ignore-certificate-errors'); // ✅ Ignore self-signed certs

let mainWindow;

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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
