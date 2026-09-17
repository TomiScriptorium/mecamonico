// Puente seguro entre el proceso principal (Electron/electron-updater) y la
// página (la misma app web de siempre). Solo expone lo mínimo: enterarse de
// que ya hay una actualización descargada, y pedir reiniciar para instalarla.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
    restartToUpdate: () => ipcRenderer.send('restart-to-update')
});
