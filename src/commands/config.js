import { Command } from 'commander';
import inquirer from 'inquirer';
import { log } from '../lib/logger.js';
import { readConfig, writeConfig, requireConfig } from '../lib/config.js';

export function configCommand() {
  const cmd = new Command('config');
  cmd.description('Manage Mstrmnd AI project configuration');

  cmd
    .command('show')
    .description('Display current project configuration')
    .action(() => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }
      log.title('\n🧠 Mstrmnd AI — Project Config\n');
      console.log(JSON.stringify(config, null, 2));
    });

  cmd
    .command('set <key> <value>')
    .description('Set a top-level configuration value (e.g. config set name my-app)')
    .action((key, value) => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }

      const reserved = ['ai', 'vercel'];
      if (reserved.includes(key)) {
        log.error(`Use "config set-ai" or "config set-vercel" for nested keys.`);
        process.exit(1);
      }

      config[key] = value;
      writeConfig(config);
      log.success(`Set ${key} = ${value}`);
    });

  cmd
    .command('set-ai')
    .description('Configure AI settings interactively')
    .action(async () => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKeyEnvVar',
          message: 'Environment variable name for the API key:',
          default: config.ai?.apiKeyEnvVar || 'MSTRMND_API_KEY',
        },
        {
          type: 'input',
          name: 'model',
          message: 'Default AI model:',
          default: config.ai?.model || 'mstrmnd-v1',
        },
      ]);

      config.ai = { ...config.ai, ...answers };
      writeConfig(config);
      log.success('AI configuration updated.');
    });

  cmd
    .command('set-vercel')
    .description('Configure Vercel deployment settings interactively')
    .action(async () => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectId',
          message: 'Vercel project ID:',
          default: config.vercel?.projectId || '',
        },
        {
          type: 'input',
          name: 'orgId',
          message: 'Vercel organization ID:',
          default: config.vercel?.orgId || '',
        },
      ]);

      config.vercel = { ...config.vercel, ...answers };
      writeConfig(config);
      log.success('Vercel configuration updated.');
    });

  return cmd;
}
