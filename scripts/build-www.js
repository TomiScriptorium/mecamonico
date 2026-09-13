// Copia los archivos de la app web (la misma fuente que se usa en el navegador)
// a la carpeta www/, que es la que Capacitor empaqueta dentro de la app de Android.
// No hay dos versiones del código: la app de Android muestra exactamente el
// mismo index.html que la versión web.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wwwDir = path.join(root, 'www');
const files = ['index.html', 'sw.js', 'manifest.json', 'iconomecamonico.png'];

fs.mkdirSync(wwwDir, { recursive: true });
for (const file of files) {
    fs.copyFileSync(path.join(root, file), path.join(wwwDir, file));
    console.log(`Copiado: ${file} -> www/${file}`);
}
