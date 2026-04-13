import { Command } from 'commander';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import ora from 'ora';
import { log } from '../lib/logger.js';
import { requireConfig } from '../lib/config.js';

const BUILD_COMMANDS = {
  nextjs: 'next build',
  react: 'vite build',
  svelte: 'vite build',
  astro: 'astro build',
};

export function buildCommand() {
  const cmd = new Command('build');

  cmd
    .description('Build the project for production')
    .option('--no-install', 'Skip dependency installation check')
    .action(async (options) => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }

      log.title(`\n🧠 Mstrmnd AI — Build (${config.template})\n`);

      const cwd = process.cwd();

      if (options.install && !existsSync(join(cwd, 'node_modules'))) {
        log.info('Installing dependencies…');
        try {
          execSync('npm install', { cwd, stdio: 'inherit' });
        } catch {
          log.error('Dependency installation failed.');
          process.exit(1);
        }
      }

      const buildCmd = BUILD_COMMANDS[config.template] || 'npm run build';
      const spinner = ora(`Building ${config.name}…`).start();

      try {
        execSync(`npx ${buildCmd}`, { cwd, stdio: 'pipe' });
        spinner.succeed('Build completed successfully!');
        log.info('Output is ready for deployment. Run `mstrmnd deploy` to push to Vercel.');
      } catch (err) {
        spinner.fail('Build failed');
        const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
        log.error(output);
        process.exit(1);
      }
    });

  return cmd;
}
