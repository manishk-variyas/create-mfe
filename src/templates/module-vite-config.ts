import { ModuleConfig, MonorepoConfig } from '../utils/types';

export function genModuleViteConfig(mod: ModuleConfig, config: MonorepoConfig): string {
  const exposeEntries = Object.entries(mod.exposes)
    .map(([k, v]) => `        '${k}': '${v}',`)
    .join('\n');

  const sharedDeps: string[] = [
    `      react: { singleton: true, requiredVersion: '^18.0.0' },`,
    `      'react-dom': { singleton: true, requiredVersion: '^18.0.0' },`,
    `      'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },`,
  ];

  if (config.shared.state) {
    sharedDeps.push(`      zustand: { singleton: true, requiredVersion: '^4.0.0' },`);
  }
  if (config.shared.reactQuery) {
    sharedDeps.push(`      '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },`);
  }

  const workspacePkgs: string[] = [];
  if (config.shared.ui)
    workspacePkgs.push(`      '@${config.name}/ui': { singleton: true },`);
  if (config.shared.utils)
    workspacePkgs.push(`      '@${config.name}/utils': { singleton: true },`);
  if (config.shared.state)
    workspacePkgs.push(`      '@${config.name}/store': { singleton: true },`);
  if (config.shared.auth)
    workspacePkgs.push(`      '@${config.name}/auth': { singleton: true },`);

  const allShared = [...sharedDeps, ...workspacePkgs].join('\n');

  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '${mod.name}',
      filename: 'remoteEntry.js',
      exposes: {
${exposeEntries}
      },
      shared: {
${allShared}
      },
    }),
  ],
  server: {
    port: ${mod.port},
    strictPort: false,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  preview: {
    port: ${mod.port},
    strictPort: false,
    cors: true,
  },
});
`;
}
