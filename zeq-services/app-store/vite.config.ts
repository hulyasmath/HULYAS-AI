import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Use process.env directly to avoid permission issues with .env files
    // Vite's loadEnv will be called internally but we'll use process.env as fallback
    const env = process.env;
    
    return {
      server: {
        port: 3001,
        host: '127.0.0.1',
      },
      plugins: [react()],
      // Point env loading to a safe empty directory (avoids unreadable .env.local)
      envDir: path.resolve(__dirname, '.vite-env'),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
