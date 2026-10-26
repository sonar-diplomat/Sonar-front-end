import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin, type PluginOption } from 'vite';

/** Portable audit of modules that actually contributed code to this build. */
function profileAudit(dataSource: 'api' | 'mock', base: string, builtAt: string): Plugin {
  return {
    name: 'sonar-build-profile',
    generateBundle(_options, bundle) {
      const modules = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const [id, info] of Object.entries(output.modules)) {
          if (info.renderedLength === 0 || id.startsWith('\0')) continue;
          modules.add(path.relative(process.cwd(), id).replaceAll('\\', '/'));
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: 'build-profile.json',
        source: JSON.stringify({ dataSource, base, builtAt, modules: [...modules].sort() }, null, 2),
      });
    },
  };
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const dataSource = env.VITE_DATA_SOURCE ?? 'api';
  if (dataSource !== 'api' && dataSource !== 'mock') {
    throw new Error(`VITE_DATA_SOURCE must be api or mock; received ${JSON.stringify(dataSource)}`);
  }
  const mock = dataSource === 'mock';
  const base = env.VITE_BASE_PATH ?? (mock ? '/Sonar-front-end/' : '/');
  if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..') || base.startsWith('//')) {
    throw new Error('VITE_BASE_PATH must be an absolute pathname with a trailing slash');
  }
  const builtAt = new Date().toISOString();
  const plugins: PluginOption[] = [react(), profileAudit(dataSource, base, builtAt)];
  if (mock) {
    const { demoMediaPlugin } = await import('./scripts/demo-media-plugin.mjs');
    plugins.push(demoMediaPlugin());
  }
  const resolve = (file: string) => path.resolve(import.meta.dirname, file);
  return {
    base,
    plugins,
    define: {
      'import.meta.env.VITE_DATA_SOURCE': JSON.stringify(dataSource),
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(builtAt),
    },
    resolve: {
      alias: {
        '@app': resolve('src/app'),
        '@pages': resolve('src/pages'),
        '@widgets': resolve('src/widgets'),
        '@features': resolve('src/features'),
        '@entities': resolve('src/entities'),
        '@shared/ui/DemoOutboxNotice': resolve(mock ? 'src/shared/ui/DemoOutboxNotice.tsx' : 'src/shared/config/empty-demo-ui.ts'),
        '@shared/ui/DemoStatus': resolve(mock ? 'src/shared/ui/DemoStatus.tsx' : 'src/shared/config/empty-demo-ui.ts'),
        '@shared/lib/audio/DemoPlayerSync': resolve(mock ? 'src/shared/lib/audio/DemoPlayerSync.tsx' : 'src/shared/config/empty-demo-player.ts'),
        '@shared/demo/media': resolve(mock ? 'src/shared/demo/media.ts' : 'src/shared/config/empty-demo-media.ts'),
        '@shared': resolve('src/shared'),
        '@demo-runtime': resolve(mock ? 'src/shared/demo/runtime.ts' : 'src/shared/config/no-demo.ts'),
        '@demo-dispatcher': resolve(mock ? 'src/shared/demo/handlers.ts' : 'src/shared/config/no-demo.ts'),
        '@demo-seed': resolve(mock ? 'demo/data/seed.json' : 'src/shared/config/no-demo.ts'),
        '@demo-media': resolve(mock ? 'demo/media-manifest.json' : 'src/shared/config/empty-media.ts'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Keep the shared rendering runtime cacheable across lazy application routes.
          advancedChunks: {
            groups: [{ name: 'react-vendor', test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler)[\\/]/ }],
          },
        },
      },
    },
    server: {
      watch: {
        ignored: ['**/.cache/**', '**/.pages/**', '**/.pages-probe/**', '**/dist/**', '**/test-results/**', '**/.tools/**'],
      },
      proxy: mock ? undefined : {
        '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5205', changeOrigin: true, secure: false },
        '/hubs': { target: env.VITE_PROXY_TARGET || 'https://localhost:7124', changeOrigin: true, secure: false, ws: true },
      },
    },
  };
});
