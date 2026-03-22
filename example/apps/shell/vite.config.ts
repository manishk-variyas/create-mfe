import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// NOTE: @originjs/vite-plugin-federation does not support Vite's dev server for remotes.
// Remotes must be built first (vite build --watch) and served via vite preview.
// Run in two separate terminals:
//   Terminal 1: pnpm run dev:remotes   (build --watch + preview for all remotes)
//   Terminal 2: pnpm run dev:shell     (vite dev for the shell)
//
// For production, set environment variables:
//   VITE_DASHBOARD_URL=https://dashboard.netlify.app
//   VITE_PROFILE_URL=https://profile.netlify.app
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const remotes = {
    'dashboard': env.VITE_DASHBOARD_URL ? `${env.VITE_DASHBOARD_URL}/assets/remoteEntry.js` : 'http://localhost:3001/assets/remoteEntry.js',
    'profile': env.VITE_PROFILE_URL ? `${env.VITE_PROFILE_URL}/assets/remoteEntry.js` : 'http://localhost:3002/assets/remoteEntry.js',
  };

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes,
        shared: {
      react: { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
      zustand: { singleton: true, requiredVersion: '^4.0.0' },
      '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
        },
      }),
    ],
    server: {
      port: 3000,
      strictPort: false,
    },
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    preview: {
      port: 3000,
      strictPort: false,
    },
  };
});
