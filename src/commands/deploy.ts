import * as path from 'path';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import { logger, formatTitle } from '../utils/logger';
import { requireConfig, updateConfig } from '../utils/config';
import { commandExists, parseEnvFile, runCommand } from '../utils/process';

interface DeployOptions {
  prod?: boolean;
  env?: string;
  yes?: boolean;
}

export async function deployCommand(options: DeployOptions = {}) {
  let config;
  try {
    config = await requireConfig();
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  console.log(formatTitle('Mstrmnd CLI — Deploy to Vercel'));

  const deployMode = options.prod ? 'production' : 'preview';
  const cwd = process.cwd();

  if (options.env) {
    if (!(await fs.pathExists(options.env))) {
      logger.error(`Environment file not found: ${options.env}`);
      process.exit(1);
    }
  }

  if (!options.yes) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Deploy "${config.projectName}" to Vercel (${deployMode})?`,
        default: true,
      },
    ]);

    if (!answers.proceed) {
      logger.info('Deployment cancelled');
      return;
    }
  }

  const hasVercel = await commandExists('vercel');
  const command = hasVercel ? 'vercel' : 'npx';
  const args = hasVercel ? ['deploy'] : ['--yes', 'vercel', 'deploy'];

  if (options.prod) {
    args.push('--prod');
  }

  if (options.env) {
    const envContent = await fs.readFile(options.env, 'utf-8');
    const envVars = parseEnvFile(envContent);
    for (const [key, value] of Object.entries(envVars)) {
      args.push('--env', `${key}=${value}`);
    }
  }

  if (!hasVercel) {
    logger.info('Vercel CLI not found on PATH; using npx vercel');
  }

  logger.command(`${command} ${args.join(' ')}`);
  logger.info(`Deploying (${deployMode})...`);

  try {
    const code = await runCommand(command, args, {
      cwd,
      stdio: 'inherit',
    });

    if (code !== 0) {
      logger.error('Deployment failed');
      process.exit(code);
    }

    logger.success('Deployment successful');

    try {
      const vercelJsonPath = path.join(cwd, '.vercel', 'project.json');
      if (await fs.pathExists(vercelJsonPath)) {
        const vercelProject = await fs.readJson(vercelJsonPath);
        await updateConfig({
          vercel: {
            projectId: vercelProject.projectId,
            orgId: vercelProject.orgId,
          },
        });
        logger.info('Saved Vercel project metadata to mstrmnd.config.json');
      }
    } catch {
      // Non-fatal
    }
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
