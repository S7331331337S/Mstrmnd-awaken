import chalk from 'chalk';
import { execSync } from 'child_process';

export const log = {
  info: (msg) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✔'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.error(chalk.red('✖'), msg),
  title: (msg) => console.log(chalk.bold.magenta(msg)),
  dim: (msg) => console.log(chalk.dim(msg)),
};

export function checkVercelCli() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

