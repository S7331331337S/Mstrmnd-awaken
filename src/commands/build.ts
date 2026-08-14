import * as path from 'path';
import * as fs from 'fs-extra';
import { logger, formatTitle } from '../utils/logger';
import { requireConfig } from '../utils/config';
import { runCommand } from '../utils/process';

interface BuildOptions {
  analyze?: boolean;
}

export async function buildCommand(options: BuildOptions = {}) {
  let config;
  try {
    config = await requireConfig();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const cwd = process.cwd();
  console.log(formatTitle(`Mstrmnd CLI — Build (${config.template})`));

  if (!(await fs.pathExists(path.join(cwd, 'node_modules')))) {
    logger.error('node_modules not found. Run npm install first.');
    process.exit(1);
  }

  let command = 'npx';
  let args: string[];
  const env: NodeJS.ProcessEnv = {};

  if (config.template === 'nextjs') {
    args = ['next', 'build'];
    if (options.analyze) {
      env.ANALYZE = 'true';
      logger.warning(
        '--analyze sets ANALYZE=true. Add @next/bundle-analyzer (or similar) to use it.'
      );
    }
  } else if (config.template === 'react' || config.template === 'vue') {
    args = ['vite', 'build'];
    if (options.analyze) {
      logger.warning('--analyze is not wired for Vite templates yet; building normally.');
    }
  } else {
    const packageJson = await fs.readJson(path.join(cwd, 'package.json'));
    if (!packageJson.scripts?.build) {
      logger.error('No build script found in package.json');
      process.exit(1);
    }
    command = 'npm';
    args = ['run', 'build'];
  }

  logger.command(`${command} ${args.join(' ')}`);

  try {
    const code = await runCommand(command, args, {
      cwd,
      env,
      stdio: 'inherit',
    });

    if (code === 0) {
      logger.success('Build completed');
      logger.info(
        config.template === 'nextjs' ? 'Output: .next/' : 'Output: dist/'
      );
      return;
    }

    logger.error(`Build failed (exit ${code})`);
    process.exit(code);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
