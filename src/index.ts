#!/usr/bin/env node
import { program } from 'commander';
import { initCommand } from './commands/init';
import { addModuleCommand } from './commands/add-module';
import { listCommand } from './commands/list';

program
  .name('create-mfe')
  .description('Scaffold Vite + React microfrontend monorepos with Module Federation')
  .version('1.0.0');

program
  .command('init [name]')
  .description('Create a new microfrontend monorepo')
  .option('--pm <manager>', 'Package manager: npm | pnpm | yarn', 'pnpm')
  .action(initCommand);

program
  .command('add [name]')
  .description('Add a new microfrontend module to an existing monorepo')
  .option('--port <port>', 'Dev server port for this module')
  .option('--type <type>', 'Module type: feature | page | shared', 'feature')
  .action(addModuleCommand);

program
  .command('list')
  .description('List all modules in the current monorepo')
  .action(listCommand);

program.parse();
