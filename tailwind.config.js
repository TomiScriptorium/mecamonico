// Config de Tailwind para compilar el CSS de las apps (ver scripts/build-www.js).
// No repite la configuración: la lee del bloque "tailwind-cdn" de index.html,
// el mismo que usa la versión web con el CDN, para que ambas nunca difieran.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const indexPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const block = html.match(/<!-- tailwind-cdn:start[\s\S]*?<!-- tailwind-cdn:end -->/);
if (!block) throw new Error('No se encontró el bloque tailwind-cdn en index.html');
const inlineScript = block[0].match(/<script>([\s\S]*?)<\/script>/);
if (!inlineScript) throw new Error('No se encontró tailwind.config en index.html');

const sandbox = { tailwind: {} };
vm.runInNewContext(inlineScript[1], sandbox);

module.exports = {
    ...sandbox.tailwind.config,
    content: [indexPath]
};
