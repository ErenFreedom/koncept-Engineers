const { app, BrowserWindow } = require('electron');
const path = require('path');
const waitOn = require('wait-on'); // ✅ Ensures Electron waits for React to start

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // ✅ Wait for React to be available before loading it in Electron
    waitOn({ resources: ['http://localhost:3000'], timeout: 5000 })
        .then(() => {
            mainWindow.loadURL('http://localhost:3000');
        })
        .catch((err) => {
            console.error("Failed to load React:", err);
        });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

// Ensure only **one** instance of Electron runs
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.whenReady().then(createWindow);

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
