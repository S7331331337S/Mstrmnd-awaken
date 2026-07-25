import { spawn } from 'child_process';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs-extra';
import { logger } from '../utils/logger';
import { loadConfig } from '../utils/config';

interface BuildOptions {
  analyze?: boolean;
}

export async function buildCommand(options?: BuildOptions) {
  const config = await loadConfig();

  if (!config) {
    logger.error('No Mstrmnd configuration found. Run "mstrmnd init" first.');
    process.exit(1);
  }

  const spinner = ora('Building project...').start();

  let command: string;
  let args: string[];

  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  if (config.template === 'nextjs') {
    command = 'npx';
    args = ['next', 'build'];
    if (options?.analyze) {
      process.env.ANALYZE = 'true';
    }
  } else if (config.template === 'react' || config.template === 'vue') {
    command = 'npx';
    args = ['vite', 'build'];
  } else {
    if (packageJson.scripts && packageJson.scripts.build) {
      command = 'npm';
      args = ['run', 'build'];
    } else {
      spinner.fail('No build command found');
      logger.error('Please configure your build script in package.json');
      process.exit(1);
    }
  }

  logger.command(`${command} ${args.join(' ')}`);

  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (error) => {
    spinner.fail('Build failed');
    logger.error(error.message);
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code === 0) {
      spinner.succeed('Build completed successfully!');

      if (config.template === 'nextjs') {
        logger.info('\nBuild output: .next/');
      } else {
        logger.info('\nBuild output: dist/');
      }
    } else {
      spinner.fail(`Build failed with exit code ${code}`);
      process.exit(code || 1);
    }
  });
}
