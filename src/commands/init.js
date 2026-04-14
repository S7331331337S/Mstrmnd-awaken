import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { log } from '../lib/logger.js';
import { writeConfig } from '../lib/config.js';

const TEMPLATES = {
  nextjs: 'Next.js (App Router)',
  react: 'React + Vite',
  svelte: 'SvelteKit',
  astro: 'Astro',
};

export function initCommand() {
  const cmd = new Command('init');

  cmd
    .description('Scaffold a new Mstrmnd AI web project')
    .argument('[name]', 'Project name')
    .option('-t, --template <template>', `Project template (${Object.keys(TEMPLATES).join(', ')})`)
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (name, options) => {
      log.title('\n🧠 Mstrmnd AI — Project Initializer\n');

      let projectName = name;
      let template = options.template;
      let aiApiKey = '';

      if (!options.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'Project name:',
            default: projectName || 'my-mstrmnd-app',
            when: !projectName,
            validate: (v) => v.trim().length > 0 || 'Project name is required',
          },
          {
            type: 'list',
            name: 'template',
            message: 'Choose a project template:',
            choices: Object.entries(TEMPLATES).map(([value, name]) => ({ name, value })),
            default: 'nextjs',
            when: !template,
          },
          {
            type: 'password',
            name: 'aiApiKey',
            message: 'Mstrmnd AI API key (leave blank to set later):',
            mask: '*',
          },
        ]);

        projectName = projectName || answers.projectName;
        template = template || answers.template;
        aiApiKey = answers.aiApiKey || '';
      } else {
        projectName = projectName || 'my-mstrmnd-app';
        template = template || 'nextjs';
      }

      if (!Object.keys(TEMPLATES).includes(template)) {
        log.error(`Unknown template: ${template}. Choose from: ${Object.keys(TEMPLATES).join(', ')}`);
        process.exit(1);
      }

      const projectDir = join(process.cwd(), projectName);

      if (existsSync(projectDir)) {
        log.error(`Directory "${projectName}" already exists.`);
        process.exit(1);
      }

      const spinner = ora(`Scaffolding ${TEMPLATES[template]} project…`).start();

      try {
        mkdirSync(projectDir, { recursive: true });

        const config = {
          name: projectName,
          template,
          version: '1.0.0',
          ai: {
            apiKeyEnvVar: 'MSTRMND_API_KEY',
          },
          vercel: {
            projectId: null,
            orgId: null,
          },
        };

        writeConfig(config, projectDir);

        writeFileSync(
          join(projectDir, '.env.local'),
          `# Mstrmnd AI Configuration\nMSTRMND_API_KEY=${aiApiKey}\n`,
          'utf8'
        );

        writeFileSync(
          join(projectDir, '.env.example'),
          `# Mstrmnd AI Configuration\nMSTRMND_API_KEY=your_api_key_here\n`,
          'utf8'
        );

        writeFileSync(
          join(projectDir, '.gitignore'),
          `.env.local\n.env\nnode_modules/\n.next/\ndist/\n.vercel/\n`,
          'utf8'
        );

        writeFileSync(
          join(projectDir, 'README.md'),
          generateReadme(projectName, template),
          'utf8'
        );

        spinner.succeed(`Project "${projectName}" created successfully!`);

        log.info(`\nNext steps:\n`);
        log.dim(`  cd ${projectName}`);
        log.dim(`  mstrmnd dev       # start local dev server`);
        log.dim(`  mstrmnd deploy    # deploy to Vercel\n`);
      } catch (err) {
        spinner.fail('Failed to scaffold project');
        log.error(err.message);
        process.exit(1);
      }
    });

  return cmd;
}

function generateReadme(name, template) {
  return `# ${name}

An AI-powered web project built with Mstrmnd AI and ${TEMPLATES[template]}.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Set your Mstrmnd AI API key
cp .env.example .env.local
# Edit .env.local and set MSTRMND_API_KEY

# Start the development server
mstrmnd dev

# Deploy to Vercel
mstrmnd deploy
\`\`\`

## Configuration

Edit \`mstrmnd.config.json\` to update project settings.

## Learn More

- [Mstrmnd AI Docs](https://mstrmnd.ai/docs)
- [Vercel Docs](https://vercel.com/docs)
`;
}
