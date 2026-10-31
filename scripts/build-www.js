// Copia los archivos de la app web (la misma fuente que se usa en el navegador)
// a la carpeta www/, que es la que Capacitor empaqueta dentro de la app de Android.
// No hay dos versiones del código: la app de Android muestra exactamente el
// mismo index.html que la versión web.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wwwDir = path.join(root, 'www');
const files = ['index.html', 'sw.js', 'manifest.json', 'iconomecamonico.png'];

const { execFileSync } = require('child_process');

fs.mkdirSync(wwwDir, { recursive: true });
for (const file of files) {
    fs.copyFileSync(path.join(root, file), path.join(wwwDir, file));
    console.log(`Copiado: ${file} -> www/${file}`);
}

// Tailwind compilado: en vez de armar los estilos en el teléfono/PC desde el
// CDN cada vez que se abre la app (lento, se ve un instante sin estilos y no
// funciona sin internet), se genera www/tailwind.css con las mismas clases y
// colores, y en www/index.html el bloque del CDN se cambia por un <link>.
const tailwindCli = require.resolve('tailwindcss/lib/cli.js');
execFileSync(process.execPath, [
    tailwindCli,
    '-c', path.join(root, 'tailwind.config.js'),
    '-i', path.join(__dirname, 'tailwind.input.css'),
    '-o', path.join(wwwDir, 'tailwind.css'),
    '--minify'
], { stdio: 'inherit' });

const wwwIndex = path.join(wwwDir, 'index.html');
let html = fs.readFileSync(wwwIndex, 'utf8');
const cdnBlock = /<!-- tailwind-cdn:start[\s\S]*?<!-- tailwind-cdn:end -->/;
if (!cdnBlock.test(html)) throw new Error('No se encontró el bloque tailwind-cdn en index.html');
// El <link> va justo antes de </head>, igual que el <style> que inyecta el
// CDN al final de la cabecera: así las clases de Tailwind (por ejemplo
// "hidden") siguen ganándole a Font Awesome y a los estilos propios.
if (!html.includes('</head>')) throw new Error('index.html no tiene </head>');
html = html
    .replace(cdnBlock, '')
    .replace('</head>', '    <link rel="stylesheet" href="tailwind.css">\n</head>')
    .replace(' https://cdn.tailwindcss.com', '');
fs.writeFileSync(wwwIndex, html);
console.log('Generado: www/tailwind.css (index.html ya no usa el CDN de Tailwind)');

// Número de esta compilación (lo pone build-android.yml antes de este script,
// con el número de ejecución del workflow). La app de Android lo usa para
// saber si la versión instalada quedó atrás respecto a la última disponible
// en GitHub. Fuera de ese workflow (por ejemplo al compilar en un PC local)
// no está definido, así que queda en 0 y esa revisión simplemente no encuentra
// nada más nuevo.
const buildNumber = parseInt(process.env.MECAMONICO_BUILD_NUMBER || '0', 10);
fs.writeFileSync(path.join(wwwDir, 'build-info.json'), JSON.stringify({ build: buildNumber }));
console.log(`Generado: www/build-info.json (build ${buildNumber})`);
