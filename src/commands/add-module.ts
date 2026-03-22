import path from 'path';
import ora from 'ora';
import { prompt } from 'enquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger';
import { MODULE_PORT_START, ModuleConfig } from '../utils/types';
import { readMfeConfig, writeMfeConfig, resolvePort } from '../utils/fs';
import { generateModule } from '../generators/module';

interface AddOptions {
  port?: string;
  type?: string;
}

export async function addModuleCommand(name: string | undefined, opts: AddOptions): Promise<void> {
  const cwd = process.cwd();

  let config;
  try {
    config = await readMfeConfig(cwd);
  } catch (err) {
    logger.error(String(err));
    process.exit(1);
  }

  // ── Prompts ──────────────────────────────────────────────────────────────
  const answers = await prompt<{
    moduleName: string;
    moduleType: 'feature' | 'page' | 'shared';
    port: number;
    exposeDefault: boolean;
  }>([
    {
      type: 'input',
      name: 'moduleName',
      message: 'Module name',
      initial: name ?? 'new-module',
      validate: (v: string) => {
        if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
        if (config.modules.find(m => m.name === v)) return `Module "${v}" already exists`;
        return true;
      },
    },
    {
      type: 'select',
      name: 'moduleType',
      message: 'Module type',
      choices: [
        { name: 'feature', message: 'feature  — a self-contained app feature' },
        { name: 'page',    message: 'page     — a full routed page / view' },
        { name: 'shared',  message: 'shared   — shared utilities or components' },
      ],
    },
    {
      type: 'numeral',
      name: 'port',
      message: 'Dev server port',
      initial: opts.port
        ? parseInt(opts.port, 10)
        : resolvePort(config.modules, MODULE_PORT_START),
    },
    {
      type: 'confirm',
      name: 'exposeDefault',
      message: 'Expose default App component via Module Federation?',
      initial: true,
    },
  ]);

  const newModule: ModuleConfig = {
    name: answers.moduleName,
    port: answers.port,
    type: answers.moduleType,
    exposes: answers.exposeDefault
      ? { './App': './src/App.tsx' }
      : {} as Record<string, string>,
  };

  const moduleDir = path.join(cwd, 'apps', answers.moduleName);
  const spinner = ora({ text: `Generating module ${chalk.cyan(answers.moduleName)}…`, color: 'cyan' }).start();

  try {
    await generateModule(moduleDir, newModule, config);
    config.modules.push(newModule);
    await writeMfeConfig(cwd, config);
    spinner.succeed(`Module ${chalk.bold(answers.moduleName)} created`);
  } catch (err) {
    spinner.fail('Module generation failed');
    logger.error(String(err));
    process.exit(1);
  }

  console.log('');
  logger.tree([
    `apps/${answers.moduleName}/`,
    `├── src/`,
    `│   ├── App.tsx`,
    `│   ├── components/`,
    `│   └── main.tsx`,
    `├── vite.config.ts`,
    `├── tsconfig.json`,
    `└── package.json`,
  ]);

  console.log('');
  logger.success(`Module running at ${chalk.cyan(`http://localhost:${answers.port}`)}`);
  logger.info(`Remember to register it in your shell's ${chalk.cyan('vite.config.ts')} remotes`);

  if (Object.keys(newModule.exposes).length > 0) {
    console.log('');
    logger.step('Module Federation remote entry:');
    logger.dim(`http://localhost:${answers.port}/assets/remoteEntry.js`);
    logger.dim(`Exposes: ${Object.keys(newModule.exposes).join(', ')}`);
  }
  console.log('');
}
