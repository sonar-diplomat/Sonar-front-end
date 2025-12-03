import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, './src/app'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@widgets': path.resolve(__dirname, './src/widgets'),
        '@features': path.resolve(__dirname, './src/features'),
        '@entities': path.resolve(__dirname, './src/entities'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:5205',
          changeOrigin: true,
          secure: false,
        },
        '/hubs': {
          target: env.VITE_PROXY_TARGET || 'https://localhost:7124',
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      }
    }
  }
})
