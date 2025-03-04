const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendNotification: (message) => {
        ipcRenderer.send('send-notification', message);
    },
});
