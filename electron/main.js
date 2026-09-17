// App de escritorio para Windows: la misma app web (www/index.html, generada
// desde index.html por scripts/build-www.js) mostrada en una ventana nativa,
// sin barra de navegador. Se actualiza sola con electron-updater (ver abajo).
const { app, BrowserWindow, Menu, shell } = require('electron');
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
        // La app abre en modo día por defecto (state.darkMode empieza en false),
        // así que el fondo de la ventana también debe ser claro: si queda oscuro
        // aquí, se ve un parche oscuro detrás de la página mientras carga o al
        // redimensionar en modo día.
        backgroundColor: '#fafafa',
        icon: path.join(__dirname, '..', 'iconomecamonico.png'),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Los enlaces que la app abre en pestaña nueva (target="_blank", como "Ver
    // en ML" del comparador de precios) deben abrir en el navegador del sistema,
    // no como una ventana nueva dentro de la propia app.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
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
