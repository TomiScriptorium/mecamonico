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

// Número de esta compilación (lo pone build-android.yml antes de este script,
// con el número de ejecución del workflow). La app de Android lo usa para
// saber si la versión instalada quedó atrás respecto a la última disponible
// en GitHub. Fuera de ese workflow (por ejemplo al compilar en un PC local)
// no está definido, así que queda en 0 y esa revisión simplemente no encuentra
// nada más nuevo.
const buildNumber = parseInt(process.env.MECAMONICO_BUILD_NUMBER || '0', 10);
fs.writeFileSync(path.join(wwwDir, 'build-info.json'), JSON.stringify({ build: buildNumber }));
console.log(`Generado: www/build-info.json (build ${buildNumber})`);
