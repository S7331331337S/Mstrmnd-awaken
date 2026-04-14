import { Command } from 'commander';
import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { log } from '../lib/logger.js';
import { requireConfig } from '../lib/config.js';

const DEV_COMMANDS = {
  nextjs: ['next', 'dev'],
  react: ['vite'],
  svelte: ['vite', 'dev'],
  astro: ['astro', 'dev'],
};

export function devCommand() {
  const cmd = new Command('dev');

  cmd
    .description('Start the local development server')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .option('--no-install', 'Skip dependency installation check')
    .action(async (options) => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }

      log.title(`\n🧠 Mstrmnd AI — Dev Server (${config.template})\n`);

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

      const templateCmd = DEV_COMMANDS[config.template] || ['npm', 'run', 'dev'];
      const [bin, ...args] = ['npx', ...templateCmd, '--port', options.port];

      log.info(`Starting dev server on http://localhost:${options.port}\n`);

      const child = spawn(bin, args, { cwd, stdio: 'inherit', shell: true });

      child.on('error', (err) => {
        log.error(`Failed to start dev server: ${err.message}`);
        process.exit(1);
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          log.error(`Dev server exited with code ${code}`);
          process.exit(code ?? 1);
        }
      });
    });

  return cmd;
}
