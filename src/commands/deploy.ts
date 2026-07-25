import { spawn } from 'child_process';
import inquirer from 'inquirer';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger, formatTitle } from '../utils/logger';
import { loadConfig, updateConfig } from '../utils/config';

interface DeployOptions {
  prod?: boolean;
  env?: string;
}

export async function deployCommand(options?: DeployOptions) {
  console.log(formatTitle('🚀 Deploy to Vercel'));

  const config = await loadConfig();

  if (!config) {
    logger.error('No Mstrmnd configuration found. Run "mstrmnd init" first.');
    process.exit(1);
  }

  const hasVercelCli = await checkVercelCli();

  if (!hasVercelCli) {
    logger.warning('Vercel CLI not found. Installing...');
    await installVercelCli();
  }

  let envFile = options?.env;
  if (envFile && !(await fs.pathExists(envFile))) {
    logger.error(`Environment file not found: ${envFile}`);
    process.exit(1);
  }

  const deployMode = options?.prod ? 'production' : 'preview';

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Deploy to ${deployMode}?`,
      default: true,
    },
  ]);

  if (!answers.proceed) {
    logger.info('Deployment cancelled.');
    return;
  }

  const spinner = ora(`Deploying to Vercel (${deployMode})...`).start();

  const args = ['deploy'];

  if (options?.prod) {
    args.push('--prod');
  }

  if (envFile) {
    const envContent = await fs.readFile(envFile, 'utf-8');
    const envVars = envContent.split('\n').filter((line) => line.trim() && !line.startsWith('#'));

    for (const envVar of envVars) {
      const [key, value] = envVar.split('=');
      if (key && value) {
        args.push('--env', `${key}=${value}`);
      }
    }
  }

  const child = spawn('vercel', args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (error) => {
    spinner.fail('Deployment failed');
    logger.error(error.message);
    process.exit(1);
  });

  child.on('close', async (code) => {
    if (code === 0) {
      spinner.succeed('Deployment successful!');

      try {
        const vercelJsonPath = path.join(process.cwd(), '.vercel', 'project.json');
        if (await fs.pathExists(vercelJsonPath)) {
          const vercelProject = await fs.readJson(vercelJsonPath);
          await updateConfig({
            vercel: {
              projectId: vercelProject.projectId,
              orgId: vercelProject.orgId,
            },
          });
        }
      } catch (error) {
        // Silently fail if we can't update config
      }
    } else {
      spinner.fail('Deployment failed');
      process.exit(code || 1);
    }
  });
}

async function checkVercelCli(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('vercel', ['--version'], { shell: true, stdio: 'ignore' });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

async function installVercelCli(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install', '-g', 'vercel'], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('Failed to install Vercel CLI'));
      }
    });

    child.on('error', reject);
  });
}
