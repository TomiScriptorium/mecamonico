// App de escritorio para Windows: la misma app web (www/index.html, generada
// desde index.html por scripts/build-www.js) mostrada en una ventana nativa,
// sin barra de navegador. Se actualiza sola con electron-updater (ver abajo).
const { app, BrowserWindow, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const serve = require('electron-serve');

// Sirve www/ desde un origen propio (app://-) en vez de file://, para que
// IndexedDB, fetch y el resto de las APIs que ya usa la app (autenticación,
// guardado local) funcionen igual que en el navegador.
const loadURL = serve({ directory: path.join(__dirname, '..', 'www') });

let mainWindow = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        backgroundColor: '#171717',
        icon: path.join(__dirname, '..', 'iconomecamonico.png'),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    await loadURL(mainWindow);
}

app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    await createWindow();

    // Revisa actualizaciones al abrir y cada 30 minutos mientras quede abierta
    // (la app de escritorio suele quedar abierta todo el día). Si encuentra una
    // versión nueva la descarga sola y avisa con una notificación del sistema
    // para reiniciar y aplicarla.
    autoUpdater.checkForUpdatesAndNotify();
    setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 30 * 60 * 1000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
