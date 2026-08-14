import * as path from 'path';
import * as fs from 'fs-extra';
import { logger, formatTitle } from '../utils/logger';
import { requireConfig } from '../utils/config';
import { runCommand } from '../utils/process';

interface DevOptions {
  port?: string;
  host?: string;
}

export async function devCommand(options: DevOptions = {}) {
  let config;
  try {
    config = await requireConfig();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const port = options.port || '3000';
  const host = options.host || 'localhost';
  const cwd = process.cwd();

  console.log(formatTitle(`Mstrmnd CLI — Dev (${config.template})`));

  if (!(await fs.pathExists(path.join(cwd, 'node_modules')))) {
    logger.warning('node_modules not found. Run npm install first.');
  }

  let command = 'npx';
  let args: string[];

  if (config.template === 'nextjs') {
    args = ['next', 'dev', '--port', port, '--hostname', host];
  } else if (config.template === 'react' || config.template === 'vue') {
    args = ['vite', '--port', port, '--host', host];
  } else {
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      logger.error('No package.json found');
      process.exit(1);
    }
    const packageJson = await fs.readJson(packageJsonPath);
    if (!packageJson.scripts?.dev) {
      logger.error('No development command found for this project');
      process.exit(1);
    }
    command = 'npm';
    args = ['run', 'dev'];
  }

  logger.command(`${command} ${args.join(' ')}`);

  try {
    const code = await runCommand(command, args, { cwd, stdio: 'inherit' });
    if (code !== 0) {
      process.exit(code);
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
