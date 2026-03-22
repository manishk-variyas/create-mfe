import chalk from 'chalk';
import { logger } from '../utils/logger';
import { readMfeConfig } from '../utils/fs';

export async function listCommand(): Promise<void> {
  const cwd = process.cwd();

  let config;
  try {
    config = await readMfeConfig(cwd);
  } catch (err) {
    logger.error(String(err));
    process.exit(1);
  }

  console.log('');
  console.log(chalk.bold(`  ${config.name}`) + chalk.dim('  —  microfrontend workspace'));
  console.log('');

  console.log(chalk.dim('  APPS'));
  console.log(`  ${chalk.cyan('shell')}  ${chalk.dim('port')} 3000  ${chalk.dim('(host)')} `);

  config.modules.forEach(mod => {
    const typeColor =
      mod.type === 'page' ? chalk.magenta :
      mod.type === 'shared' ? chalk.yellow :
      chalk.green;

    const exposeList = Object.keys(mod.exposes).join(', ') || chalk.dim('none');

    console.log(
      `  ${chalk.cyan(mod.name.padEnd(18))}` +
      `${chalk.dim('port')} ${String(mod.port).padEnd(6)}` +
      `${typeColor(mod.type.padEnd(8))}` +
      `${chalk.dim('exposes: ')}${exposeList}`
    );
  });

  console.log('');
  console.log(chalk.dim('  SHARED PACKAGES'));
  const pkgs: string[] = [];
  if (config.shared.ui)    pkgs.push(`  ${chalk.cyan('packages/ui')}     shadcn/ui components`);
  if (config.shared.utils) pkgs.push(`  ${chalk.cyan('packages/utils')}  hooks & helpers`);
  if (config.shared.state) pkgs.push(`  ${chalk.cyan('packages/store')}  Zustand global store`);
  if (config.shared.auth)  pkgs.push(`  ${chalk.cyan('packages/auth')}   auth context & route guards`);
  pkgs.forEach(p => console.log(p));

  console.log('');
  console.log(chalk.dim(`  package manager: ${config.packageManager}`));
  console.log('');
}
