import chalk from 'chalk';
import { logger } from '../utils/logger';
import {
  loadConfig,
  saveConfig,
  getConfigValue,
  setConfigPath,
  parseConfigValue,
  MstrmndConfig,
} from '../utils/config';

type ConfigAction = 'get' | 'set' | 'list';

export async function configCommand(action?: string, key?: string, value?: string) {
  const config = await loadConfig();

  if (!config) {
    logger.error('No Mstrmnd configuration found. Run "mstrmnd init" first.');
    process.exit(1);
  }

  const validAction = (action || 'list') as ConfigAction;

  switch (validAction) {
    case 'list':
      listConfig(config);
      break;

    case 'get':
      if (!key) {
        logger.error('Usage: mstrmnd config get <key>');
        process.exit(1);
      }
      try {
        const resolved = getConfigValue(config, key);
        console.log(typeof resolved === 'string' ? resolved : JSON.stringify(resolved, null, 2));
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
      break;

    case 'set':
      if (!key || value === undefined) {
        logger.error('Usage: mstrmnd config set <key> <value>');
        process.exit(1);
      }
      try {
        const updated = setConfigPath(config, key, parseConfigValue(value));
        await saveConfig(updated);
        logger.success(`Updated ${key}`);
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
      break;

    default:
      logger.error(`Invalid action "${action}". Use list, get, or set.`);
      process.exit(1);
  }
}

function listConfig(config: MstrmndConfig) {
  console.log(chalk.bold('\nMstrmnd Configuration\n'));
  console.log(chalk.cyan('projectName:'), config.projectName);
  console.log(chalk.cyan('template:'), config.template);
  console.log(chalk.cyan('aiEnabled:'), config.aiEnabled);

  if (config.ai) {
    console.log(chalk.cyan('ai.apiKeyEnvVar:'), config.ai.apiKeyEnvVar ?? '(unset)');
    console.log(chalk.cyan('ai.model:'), config.ai.model ?? '(unset)');
  }

  if (config.vercel) {
    console.log(chalk.cyan('vercel.projectId:'), config.vercel.projectId ?? '(unset)');
    console.log(chalk.cyan('vercel.orgId:'), config.vercel.orgId ?? '(unset)');
  }

  console.log();
}
