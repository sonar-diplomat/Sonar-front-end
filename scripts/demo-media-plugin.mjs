import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { creditsHtml, staticMiddleware } from './static-server.mjs';

export function demoMediaPlugin() {
  let root; let base;
  return {
    name: 'sonar-demo-media',
    apply: 'serve',
    configResolved(config) { root = config.root; base = config.base; },
    async configureServer(server) {
      const manifest = JSON.parse(await readFile(path.join(root, 'demo/media-manifest.json'), 'utf8'));
      const allow = new Set([...manifest.audio, ...manifest.images].map(entry => entry.path));
      server.middlewares.use(async (request, response, next) => {
        if (new URL(request.url, 'http://localhost').pathname !== `${base}media-credits.html`) return next();
        try { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(await creditsHtml(root)); }
        catch (error) { next(error); }
      });
      const media = staticMiddleware(path.join(root, 'demo'), { base, prefix: 'demo/', allow, nextOnMiss: true });
      server.middlewares.use((request, response, next) => {
        // Vite transforms seed/manifest JSON imports itself (including ?import/HMR).
        // The asset responder owns only media bytes, so it must not turn modules into 404s.
        if (new URL(request.url, 'http://localhost').pathname.endsWith('.json')) return next();
        return media(request, response, next);
      });
    },
  };
}
