#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { deployCommand } from './commands/deploy';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('mstrmnd')
  .description('CLI tool for Mstrmnd AI web development')
  .version('0.1.0');

program
  .command('init [project-name]')
  .description('Initialize a new Mstrmnd AI web project')
  .option('-t, --template <template>', 'Project template (nextjs, react, vue)', 'nextjs')
  .option('--ai', 'Include AI integration setup')
  .action(initCommand);

program
  .command('dev')
  .description('Start the development server')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-H, --host <host>', 'Host to bind the server to', 'localhost')
  .action(devCommand);

program
  .command('build')
  .description('Build the project for production')
  .option('--analyze', 'Analyze the bundle size')
  .action(buildCommand);

program
  .command('deploy')
  .description('Deploy the project to Vercel')
  .option('--prod', 'Deploy to production')
  .option('--env <env>', 'Environment variables file')
  .action(deployCommand);

program
  .command('config')
  .description('Manage project configuration')
  .argument('[action]', 'Action to perform (get, set, list)', 'list')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .action(configCommand);

program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
