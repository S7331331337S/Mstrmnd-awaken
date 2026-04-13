import chalk from 'chalk';

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.error(chalk.red('✖'), message),
  command: (message: string) => console.log(chalk.cyan('$'), chalk.dim(message)),
};

export const formatTitle = (title: string): string => {
  return chalk.bold.magenta(`\n${title}\n`);
};
