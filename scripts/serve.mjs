import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

const port = Number(process.env.PORT || 5173);
const source = new URL('../', import.meta.url);
const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', woff2: 'font/woff2' };
const allowed = /^(?:index\.html|(?:src|styles)\/(?:[\w-]+\/)*[\w-]+\.(?:css|js|woff2))$/;

createServer(async (request, response) => {
  let path;
  try {
    path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).slice(1) || 'index.html';
    if (!allowed.test(path)) throw new Error('Path outside app');
    const asset = new URL(path, source);
    if (!(await stat(asset)).isFile()) throw new Error('Asset missing');
    response.writeHead(200, {
      'Content-Type': path.endsWith('.woff2') ? types.woff2 : `${types[path.split('.').pop()]}; charset=utf-8`,
      'Cache-Control': 'no-store',
    });
    const stream = createReadStream(asset);
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch {
    response.writeHead(404).end('Page not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`SmartPrep at http://127.0.0.1:${port}/`));
