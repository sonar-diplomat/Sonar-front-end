import { createReadStream } from 'node:fs';
import { lstat, realpath, readFile, open } from 'node:fs/promises';
import path from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.flac': 'audio/flac',
  '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

export function normalizeBase(base = '/') {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)) throw new Error('Base must be an absolute URL pathname ending with /');
  return base;
}

export function isPointer(buffer) {
  return buffer.subarray(0, 128).toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1');
}

export function staticMiddleware(root, { base = '/', prefix = '', allow, nextOnMiss = false } = {}) {
  root = path.resolve(root);
  base = normalizeBase(base);
  const mount = `${base}${prefix}`;
  return async (request, response, next = () => {}) => {
    const fail = (status, message) => { response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end(message); };
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith(mount)) return nextOnMiss ? next() : fail(404, 'Not found');
      if (!['GET', 'HEAD'].includes(request.method)) { response.setHeader('Allow', 'GET, HEAD'); return fail(405, 'Method not allowed'); }
      const relative = pathname.slice(mount.length) || 'index.html';
      if (relative.includes('\\') || relative.split('/').some(part => part === '..' || part.startsWith('.'))) return fail(404, 'Not found');
      if (allow && !allow.has(relative)) return fail(404, 'Not found');
      const filename = path.resolve(root, relative);
      if (!filename.startsWith(`${root}${path.sep}`)) return fail(404, 'Not found');
      const actual = await realpath(filename);
      if (!actual.startsWith(`${await realpath(root)}${path.sep}`)) return fail(404, 'Not found');
      const stat = await lstat(actual);
      if (!stat.isFile()) return fail(404, 'Not found');
      if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(filename)) {
        const handle = await open(actual);
        try { const bytes = Buffer.alloc(128); await handle.read(bytes, 0, bytes.length, 0); if (isPointer(bytes)) return fail(503, 'Media contains an LFS pointer; run task media:pull'); } finally { await handle.close(); }
      }
      const headers = { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' };
      let start = 0; let end = stat.size - 1; let status = 200;
      if (request.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
        if (!match || (!match[1] && !match[2])) { response.setHeader('Content-Range', `bytes */${stat.size}`); return fail(416, 'Invalid range'); }
        if (!match[1]) start = Math.max(0, stat.size - Number(match[2]));
        else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
        if (!Number.isSafeInteger(start) || start > end || start >= stat.size) { response.setHeader('Content-Range', `bytes */${stat.size}`); return fail(416, 'Range not satisfiable'); }
        status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      }
      headers['Content-Length'] = String(Math.max(0, end - start + 1));
      response.writeHead(status, headers);
      if (request.method === 'HEAD' || stat.size === 0) return response.end();
      const stream = createReadStream(actual, { start, end });
      response.on('close', () => stream.destroy());
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes(error.code)) return fail(404, 'Not found');
      return fail(error instanceof URIError ? 400 : 500, 'Unable to serve file');
    }
  };
}

export async function creditsHtml(root) {
  const licenses = JSON.parse(await readFile(path.join(root, 'demo/licenses.json'), 'utf8'));
  const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const records = licenses.records.map(record => `<li><strong>${escape(record.title)}</strong> — ${escape(record.author)}. <a href="${escape(record.sourceUrl)}">Source</a>; <a href="${escape(record.licenseUrl)}">${escape(record.license)}</a>. ${escape(record.attribution)} Changes: ${escape(record.changes)}</li>`).join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sonar demo media credits</title><style>body{font:18px/1.6 system-ui;max-width:850px;margin:40px auto;padding:20px;background:#10111b;color:#eee}a{color:#aebcff}li{margin-bottom:20px}</style><h1>Demo media credits</h1><p>Music credits identify the original creators. Artist profiles in the demo are fictional.</p><ul>${records}</ul></html>`;
}
