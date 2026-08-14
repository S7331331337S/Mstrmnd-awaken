import inquirer from 'inquirer';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger, formatTitle } from '../utils/logger';
import {
  saveConfig,
  MstrmndConfig,
  TemplateName,
  isTemplateName,
  VALID_TEMPLATES,
} from '../utils/config';
import { scaffoldProject } from '../utils/templates';

interface InitOptions {
  template?: string;
  ai?: boolean;
  yes?: boolean;
}

export async function initCommand(projectName?: string, options: InitOptions = {}) {
  console.log(formatTitle('Mstrmnd CLI — Initialize Project'));

  let name = projectName;
  let template: TemplateName = 'nextjs';
  let aiEnabled = Boolean(options.ai);

  if (options.template) {
    if (!isTemplateName(options.template)) {
      logger.error(
        `Unknown template "${options.template}". Choose from: ${VALID_TEMPLATES.join(', ')}`
      );
      process.exit(1);
    }
    template = options.template;
  }

  if (!options.yes && (!name || !options.template || options.ai === undefined)) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: name || 'my-mstrmnd-app',
        when: !name,
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-z0-9-_]+$/i.test(input)) {
            return 'Use letters, numbers, hyphens, and underscores only';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: [
          { name: 'Next.js (App Router)', value: 'nextjs' },
          { name: 'React + Vite', value: 'react' },
          { name: 'Vue + Vite', value: 'vue' },
        ],
        default: template,
        when: !options.template,
      },
      {
        type: 'confirm',
        name: 'aiEnabled',
        message: 'Include OpenAI integration stubs?',
        default: true,
        when: options.ai === undefined,
      },
    ]);

    name = name || answers.projectName;
    template = (answers.template as TemplateName) || template;
    if (options.ai === undefined) {
      aiEnabled = Boolean(answers.aiEnabled);
    }
  }

  name = name || 'my-mstrmnd-app';

  if (!/^[a-z0-9-_]+$/i.test(name)) {
    logger.error('Project name can only contain letters, numbers, hyphens, and underscores');
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), name);

  if (await fs.pathExists(projectPath)) {
    logger.error(`Directory "${name}" already exists`);
    process.exit(1);
  }

  const spinner = ora(`Creating ${template} project...`).start();

  try {
    await scaffoldProject(projectPath, name, template, aiEnabled);

    const config: MstrmndConfig = {
      projectName: name,
      template,
      aiEnabled,
      ...(aiEnabled
        ? {
            ai: {
              apiKeyEnvVar: 'OPENAI_API_KEY',
              model: 'gpt-4o-mini',
            },
          }
        : {}),
    };

    await saveConfig(config, projectPath);
    spinner.succeed(`Project "${name}" created`);

    logger.success(`Initialized ${template} project at ./${name}`);
    logger.info('Next steps:');
    logger.command(`cd ${name}`);
    logger.command('npm install');
    logger.command('npm run dev');

    if (aiEnabled) {
      logger.warning('Copy .env.example to .env.local and set OPENAI_API_KEY');
    }
  } catch (error) {
    spinner.fail('Failed to create project');
    logger.error(error instanceof Error ? error.message : String(error));
    await fs.remove(projectPath).catch(() => undefined);
    process.exit(1);
  }
}
