import path from 'path';
import { fileURLToPath } from 'url';
import { generateMonorepo } from '../src/generators/monorepo';
import { MonorepoConfig, MODULE_PORT_START } from '../src/utils/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const config: MonorepoConfig = {
    name: 'full-monorepo',
    packageManager: 'pnpm',
    shared: {
      ui: true,
      utils: true,
      state: true,
      auth: true,
      reactQuery: true,
      shadcn: true,
    },
    includeApi: true,
    modules: [
      {
        name: 'dashboard',
        port: MODULE_PORT_START,
        type: 'feature',
        exposes: {
          './App': './src/App.tsx',
        },
      },
      {
        name: 'profile',
        port: MODULE_PORT_START + 1,
        type: 'feature',
        exposes: {
          './App': './src/App.tsx',
        },
      },
    ],
  };

  const targetDir = '/Users/pablo/Downloads/mfe-cli/example';
  await generateMonorepo(targetDir, config);
  console.log('Example created at:', targetDir);
}

main().catch(console.error);