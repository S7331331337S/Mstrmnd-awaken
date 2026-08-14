#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { initCommand } from './commands/init';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { deployCommand } from './commands/deploy';
import { configCommand } from './commands/config';

function readPackageVersion(): string {
  try {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const program = new Command();

program
  .name('mstrmnd')
  .description('CLI for scaffolding, developing, and deploying Mstrmnd web projects')
  .version(readPackageVersion());

program
  .command('init [project-name]')
  .description('Initialize a new project')
  .option('-t, --template <template>', 'Template: nextjs, react, or vue')
  .option('--ai', 'Include OpenAI integration stubs')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(initCommand);

program
  .command('dev')
  .description('Start the development server')
  .option('-p, --port <port>', 'Port', '3000')
  .option('-H, --host <host>', 'Host', 'localhost')
  .action(devCommand);

program
  .command('build')
  .description('Build the project for production')
  .option('--analyze', 'Hint for bundle analysis tooling')
  .action(buildCommand);

program
  .command('deploy')
  .description('Deploy the project to Vercel')
  .option('--prod', 'Deploy to production')
  .option('--env <file>', 'Env file to pass as Vercel --env flags')
  .option('-y, --yes', 'Skip confirmation prompt')
  .action(deployCommand);

program
  .command('config')
  .description('Manage project configuration')
  .argument('[action]', 'list | get | set', 'list')
  .argument('[key]', 'Configuration key (dot paths supported)')
  .argument('[value]', 'Value for set')
  .action(configCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
