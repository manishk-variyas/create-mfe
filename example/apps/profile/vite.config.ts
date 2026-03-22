import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'profile',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
      react: { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
      zustand: { singleton: true, requiredVersion: '^4.0.0' },
      '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
      '@full-monorepo/ui': { singleton: true },
      '@full-monorepo/utils': { singleton: true },
      '@full-monorepo/store': { singleton: true },
      '@full-monorepo/auth': { singleton: true },
      },
    }),
  ],
  server: {
    port: 3002,
    strictPort: false,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  preview: {
    port: 3002,
    strictPort: false,
    cors: true,
  },
});
