import { SharedConfig } from '../utils/types';

export function genShellPackageJson(workspaceName: string, shared: SharedConfig): object {
  const workspaceDeps: Record<string, string> = {};
  if (shared.ui)    workspaceDeps[`@${workspaceName}/ui`]    = 'workspace:*';
  if (shared.utils) workspaceDeps[`@${workspaceName}/utils`] = 'workspace:*';
  if (shared.state) workspaceDeps[`@${workspaceName}/store`] = 'workspace:*';
  if (shared.auth)  workspaceDeps[`@${workspaceName}/auth`]  = 'workspace:*';

  return {
    name: `@${workspaceName}/shell`,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      serve: 'vite build && vite preview',
      preview: 'vite preview',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.22.0',
      ...(shared.state ? { zustand: '^4.5.0' } : {}),
      ...(shared.reactQuery ? { 
        '@tanstack/react-query': '^5.24.1',
        '@tanstack/react-query-devtools': '^5.24.1'
      } : {}),
      ...workspaceDeps,
    },
    devDependencies: {
      '@originjs/vite-plugin-federation': '^1.3.5',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.2.0',
      autoprefixer: '^10.4.18',
      postcss: '^8.4.35',
      tailwindcss: '^3.4.1',
      typescript: '^5.3.3',
      vite: '^5.1.0',
    },
  };
}
