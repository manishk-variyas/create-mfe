import path from 'path';
import { MonorepoConfig, SHELL_PORT } from '../utils/types';
import { writeFile, writeJson } from '../utils/fs';
import { generateModule } from './module';
import { generateSharedUi } from './shared-ui';
import { generateSharedUtils } from './shared-utils';
import { generateSharedStore } from './shared-store';
import { generateSharedAuth } from './shared-auth';
import { generateApi } from './api';
import { genRootPackageJson } from '../templates/root-package';
import { genRootTsConfig } from '../templates/root-tsconfig';
import { genShellViteConfig } from '../templates/shell-vite-config';
import { genShellPackageJson } from '../templates/shell-package';
import { genShellApp } from '../templates/shell-app';
import { genShellMain } from '../templates/shell-main';
import { genShellIndex } from '../templates/shell-index';
import { genPnpmWorkspace } from '../templates/pnpm-workspace';
import { genGitignore } from '../templates/gitignore';
import { genReadme } from '../templates/readme';
import { genPostcssConfig, genAppTailwindConfig, genGlobalCss } from '../templates/tailwind-setup';
import { genNetlifyToml, genModuleNetlifyToml } from '../templates/netlify-config';

export async function generateMonorepo(targetDir: string, config: MonorepoConfig): Promise<void> {
  const { name, packageManager, shared, modules, includeApi } = config;
  const API_PORT = 3005;

  // ── Root files ─────────────────────────────────────────────────────────
  await writeJson(path.join(targetDir, 'package.json'), genRootPackageJson(name, packageManager, includeApi));
  await writeFile(path.join(targetDir, 'tsconfig.json'), genRootTsConfig());
  await writeFile(path.join(targetDir, '.gitignore'), genGitignore());
  await writeFile(path.join(targetDir, 'README.md'), genReadme(name, modules));
  await writeFile(path.join(targetDir, '.env'), `VITE_API_URL=http://localhost:${API_PORT}/api`);

  if (packageManager === 'pnpm') {
    await writeFile(path.join(targetDir, 'pnpm-workspace.yaml'), genPnpmWorkspace(shared, includeApi));
  }

  // ── Shell app ──────────────────────────────────────────────────────────
  const shellDir = path.join(targetDir, 'apps', 'shell');
  await writeJson(path.join(shellDir, 'package.json'), genShellPackageJson(name, shared));
  await writeFile(path.join(shellDir, 'vite.config.ts'), genShellViteConfig(modules, shared, includeApi));
  await writeFile(path.join(shellDir, 'tsconfig.json'), genModuleTsConfig());
  await writeFile(path.join(shellDir, 'index.html'), genShellIndex(name));
  await writeFile(path.join(shellDir, 'src', 'main.tsx'), genShellMain(shared));
  await writeFile(path.join(shellDir, 'src', 'App.tsx'), genShellApp(modules, shared, name, includeApi));
  await writeFile(path.join(shellDir, 'src', 'vite-env.d.ts'), genViteEnvDts());
  await writeFile(path.join(shellDir, 'src', 'env.d.ts'), `/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}`);

  // Tailwind + CSS
  await writeFile(path.join(shellDir, 'postcss.config.js'), genPostcssConfig());
  await writeFile(path.join(shellDir, 'tailwind.config.ts'), genAppTailwindConfig(name));
  await writeFile(path.join(shellDir, 'src', 'index.css'), genGlobalCss());

  // Netlify config
  await writeFile(path.join(targetDir, 'netlify.toml'), genNetlifyToml());

  // ── Modules ────────────────────────────────────────────────────────────
  for (const mod of modules) {
    const modDir = path.join(targetDir, 'apps', mod.name);
    await generateModule(modDir, mod, config);
  }

  // ── Shared packages ────────────────────────────────────────────────────
  if (shared.ui)    await generateSharedUi(path.join(targetDir, 'packages', 'ui'), name);
  if (shared.utils) await generateSharedUtils(path.join(targetDir, 'packages', 'utils'), name);
  if (shared.state) await generateSharedStore(path.join(targetDir, 'packages', 'store'), name);
  if (shared.auth)  await generateSharedAuth(path.join(targetDir, 'packages', 'auth'), name);

  // ── API Server ─────────────────────────────────────────────────────────
  if (includeApi) {
    await generateApi(path.join(targetDir, 'api'), name);
  }
}

export function genModuleTsConfig(): string {
  return JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src',
    },
    include: ['src'],
  }, null, 2);
}

export function genViteEnvDts(): string {
  return `/// <reference types="vite/client" />\n`;
}
