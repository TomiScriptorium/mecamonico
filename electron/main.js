// App de escritorio para Windows: la misma app web (www/index.html, generada
// desde index.html por scripts/build-www.js) mostrada en una ventana nativa,
// sin barra de navegador. Se actualiza sola con electron-updater (ver abajo).
const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const serve = require('electron-serve');

// Identidad estable de la app ante Windows. Sin esto, el acceso directo
// fijado en la barra de tareas puede desvincularse del ícono de la app
// después de una actualización (Windows ya no reconoce que es "la misma
// app"). Debe coincidir con el "appId" de electron-builder en package.json.
app.setAppUserModelId('cl.mecamonico.taller.desktop');

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
        show: false, // se muestra ya maximizada en "ready-to-show", para evitar el parpadeo de la ventana chica
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
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
    // (la app de escritorio suele quedar abierta todo el día). autoDownload
    // queda en su valor por defecto (true): se descarga sola en segundo plano.
    // No se usa checkForUpdatesAndNotify() porque esa muestra una notificación
    // nativa de Windows en inglés; en vez de eso, al terminar de descargar se
    // avisa con un modal propio de la app (ver 'update-downloaded' más abajo).
    autoUpdater.checkForUpdates();
    setInterval(() => autoUpdater.checkForUpdates(), 30 * 60 * 1000);
});

// Cuando la actualización ya se descargó, se le avisa a la página (que
// muestra un modal con el mismo estilo del resto de la app, en español) en
// vez de dejar que electron-updater muestre su notificación nativa.
autoUpdater.on('update-downloaded', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-downloaded');
    }
});

// La página pide reiniciar (el usuario confirmó en el modal) para instalar
// la actualización ya descargada.
ipcMain.on('restart-to-update', () => {
    autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
