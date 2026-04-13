import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import { logger } from '../utils/logger';
import { loadConfig } from '../utils/config';

interface DevOptions {
  port?: string;
  host?: string;
}

export async function devCommand(options?: DevOptions) {
  const config = await loadConfig();

  if (!config) {
    logger.error('No Mstrmnd configuration found. Run "mstrmnd init" first.');
    process.exit(1);
  }

  const port = options?.port || '3000';
  const host = options?.host || 'localhost';

  logger.info(`Starting development server for ${config.projectName}...\n`);

  let command: string;
  let args: string[];

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  if (config.template === 'nextjs') {
    command = 'npx';
    args = ['next', 'dev', '-p', port, '-H', host];
  } else if (config.template === 'react' || config.template === 'vue') {
    command = 'npx';
    args = ['vite', '--port', port, '--host', host];
  } else {
    if (packageJson.scripts && packageJson.scripts.dev) {
      command = 'npm';
      args = ['run', 'dev'];
    } else {
      logger.error('No development command found. Please configure your project.');
      process.exit(1);
    }
  }

  logger.command(`${command} ${args.join(' ')}`);

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (error) => {
    logger.error(`Failed to start dev server: ${error.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      logger.error(`Dev server exited with code ${code}`);
      process.exit(code || 1);
    }
  });
}
