import chalk from 'chalk';
import { logger } from '../utils/logger';
import { loadConfig, updateConfig, MstrmndConfig } from '../utils/config';

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
        logger.error('Key is required for "get" action. Usage: mstrmnd config get <key>');
        process.exit(1);
      }
      getConfigValue(config, key);
      break;

    case 'set':
      if (!key || !value) {
        logger.error('Key and value are required for "set" action. Usage: mstrmnd config set <key> <value>');
        process.exit(1);
      }
      await setConfigValue(config, key, value);
      break;

    default:
      logger.error(`Invalid action: ${action}. Valid actions are: list, get, set`);
      process.exit(1);
  }
}

function listConfig(config: MstrmndConfig) {
  console.log(chalk.bold('\n📋 Mstrmnd Configuration:\n'));

  console.log(chalk.cyan('Project Name:'), config.projectName);
  console.log(chalk.cyan('Template:'), config.template);
  console.log(chalk.cyan('AI Enabled:'), config.aiEnabled ? 'Yes' : 'No');

  if (config.vercel) {
    console.log(chalk.cyan('\nVercel:'));
    if (config.vercel.projectId) {
      console.log('  Project ID:', config.vercel.projectId);
    }
    if (config.vercel.orgId) {
      console.log('  Org ID:', config.vercel.orgId);
    }
  }

  console.log();
}

function getConfigValue(config: MstrmndConfig, key: string) {
  const keys = key.split('.');
  let value: any = config;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      logger.error(`Configuration key not found: ${key}`);
      process.exit(1);
    }
  }

  console.log(value);
}

async function setConfigValue(config: MstrmndConfig, key: string, value: string) {
  const keys = key.split('.');
  const updates: any = {};

  let current = updates;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = {};
    current = current[keys[i]];
  }

  const parsedValue = parseValue(value);
  current[keys[keys.length - 1]] = parsedValue;

  try {
    await updateConfig(updates);
    logger.success(`Configuration updated: ${key} = ${parsedValue}`);
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function parseValue(value: string): any {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}
