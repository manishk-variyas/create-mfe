import path from 'path';
import ora from 'ora';
import { prompt } from 'enquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger';
import { MonorepoConfig, SHELL_PORT, MODULE_PORT_START } from '../utils/types';
import { writeMfeConfig } from '../utils/fs';
import { generateMonorepo } from '../generators/monorepo';

interface InitOptions {
  pm: string;
}

export async function initCommand(name: string | undefined, opts: InitOptions): Promise<void> {
  logger.banner();

  // ── Prompts ──────────────────────────────────────────────────────────────
  const answers = await prompt<{
    projectName: string;
    packageManager: 'npm' | 'pnpm' | 'yarn';
    modules: string;
    includeUi: boolean;
    includeUtils: boolean;
    includeState: boolean;
    includeAuth: boolean;
    includeReactQuery: boolean;
    includeShadcn: boolean;
  }>([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name',
      initial: name ?? 'my-mfe-app',
      validate: (v: string) => /^[a-z0-9-]+$/.test(v) || 'Use lowercase letters, numbers, and hyphens only',
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Package manager',
      choices: ['pnpm', 'npm', 'yarn'],
      initial: opts.pm === 'yarn' ? 2 : opts.pm === 'npm' ? 1 : 0,
    },
    {
      type: 'input',
      name: 'modules',
      message: 'Initial module names, comma-separated (e.g. dashboard,profile,settings)',
      initial: 'dashboard,profile',
    },
    {
      type: 'confirm',
      name: 'includeUi',
      message: 'Include shared UI library (shadcn/ui components)?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'includeUtils',
      message: 'Include shared utils/hooks library?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'includeState',
      message: 'Include shared state (Zustand)?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'includeAuth',
      message: 'Include auth & routing module?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'includeReactQuery',
      message: 'Include React Query for data fetching?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'includeShadcn',
      message: 'Setup Shadcn UI in shared components?',
      initial: true,
    },
  ]);

  const moduleNames = answers.modules
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

  const config: MonorepoConfig = {
    name: answers.projectName,
    packageManager: answers.packageManager,
    shared: {
      ui: answers.includeUi,
      utils: answers.includeUtils,
      state: answers.includeState,
      auth: answers.includeAuth,
      reactQuery: answers.includeReactQuery,
      shadcn: answers.includeShadcn,
    },
    modules: moduleNames.map((modName, i) => ({
      name: modName,
      port: MODULE_PORT_START + i,
      type: 'feature',
      exposes: {
        [`./App`]: './src/App.tsx',
      },
    })),
  };

  const targetDir = path.resolve(process.cwd(), answers.projectName);

  // ── Generate ──────────────────────────────────────────────────────────────
  console.log('');
  const spinner = ora({ text: 'Scaffolding project…', color: 'cyan' }).start();

  try {
    await generateMonorepo(targetDir, config);
    await writeMfeConfig(targetDir, config);
    spinner.succeed('Project scaffolded');
  } catch (err) {
    spinner.fail('Scaffolding failed');
    logger.error(String(err));
    process.exit(1);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('');
  logger.success(`Created ${chalk.bold(answers.projectName)}/`);
  console.log('');
  logger.tree([
    `${answers.projectName}/`,
    `├── apps/`,
    `│   ├── shell/              (host app, port ${SHELL_PORT})`,
    ...config.modules.map((m, i) => {
      const isLast = i === config.modules.length - 1 && !answers.includeUi && !answers.includeUtils && !answers.includeState && !answers.includeAuth;
      const prefix = isLast ? '└──' : '├──';
      return `│   ${prefix} ${m.name}/          (module, port ${m.port})`;
    }),
    `├── packages/`,
    ...(answers.includeUi ? ['│   ├── ui/                 (shadcn components)'] : []),
    ...(answers.includeUtils ? ['│   ├── utils/              (shared hooks & helpers)'] : []),
    ...(answers.includeState ? ['│   ├── store/              (Zustand global store)'] : []),
    ...(answers.includeAuth ? ['│   ├── auth/               (auth context & guards)'] : []),
    ...(answers.includeReactQuery ? ['│   ├── (react-query)        (configured in shell & modules)'] : []),
    ...(answers.includeShadcn ? ['│   └── (shadcn)             (initialized in packages/ui)'] : []),
    `├── mfe.config.json`,
    `└── package.json            (workspace root)`,
  ]);

  console.log('');
  logger.step('Next steps:');
  logger.dim(`cd ${answers.projectName}`);
  logger.dim(`${answers.packageManager} install`);
  logger.dim(`${answers.packageManager} run dev`);
  console.log('');
  logger.info(`Add more modules any time with ${chalk.cyan('create-mfe add <name>')}`);
  console.log('');
}
