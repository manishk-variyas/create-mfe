import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('  ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('  ✔'), msg),
  warn: (msg: string) => console.log(chalk.yellow('  ⚠'), msg),
  error: (msg: string) => console.log(chalk.red('  ✖'), msg),
  step: (msg: string) => console.log(chalk.bold.white('\n  →'), msg),
  dim: (msg: string) => console.log(chalk.dim('   ', msg)),

  banner: () => {
    console.log('');
    console.log(chalk.bold.cyan('  ┌─────────────────────────────┐'));
    console.log(chalk.bold.cyan('  │') + chalk.bold.white('       create-mfe  v1.0       ') + chalk.bold.cyan('│'));
    console.log(chalk.bold.cyan('  │') + chalk.dim('  Vite · React · Federation  ') + chalk.bold.cyan(' │'));
    console.log(chalk.bold.cyan('  └─────────────────────────────┘'));
    console.log('');
  },

  tree: (lines: string[]) => {
    lines.forEach(line => console.log(chalk.dim('  ' + line)));
  },
};
