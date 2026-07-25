#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs/promises');
const path = require('path');
const pkg = require('../package.json');

const AVAILABLE_TEMPLATES = ['vanilla'];

const program = new Command();

program
  .name('mstrmnd')
  .description('CLI to scaffold Mstrmnd web projects and Vercel-ready starters.')
  .version(pkg.version);

program
  .command('init')
  .argument('[directory]', 'project directory', '.')
  .option('-t, --template <name>', 'template to use', 'vanilla')
  .option('--vercel', 'include vercel.json for Vercel deployments', false)
  .option('--api', 'add an example serverless API route (api/hello.js)', false)
  .option('-f, --force', 'overwrite existing files when the directory is not empty', false)
  .action(async (directory = '.', options) => {
    const targetDir = path.resolve(process.cwd(), directory);
    try {
      await ensureWritableTarget(targetDir, options.force);
      await scaffoldProject({
        template: options.template,
        targetDir,
        includeVercel: options.vercel,
        includeApi: options.api,
      });
      printSuccess(targetDir, options);
    } catch (error) {
      console.error(`✖ ${error.message}`);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);

async function ensureWritableTarget(targetDir, force) {
  try {
    const stats = await fs.stat(targetDir);
    if (!stats.isDirectory()) {
      throw new Error(`Target ${targetDir} exists and is not a directory.`);
    }
    const contents = await fs.readdir(targetDir);
    if (contents.length > 0 && !force) {
      throw new Error(
        `Target directory ${targetDir} is not empty. Re-run with --force to overwrite existing content.`,
      );
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(targetDir, { recursive: true });
      return;
    }
    throw error;
  }
}

async function scaffoldProject({ template, targetDir, includeVercel, includeApi }) {
  if (!AVAILABLE_TEMPLATES.includes(template)) {
    throw new Error(`Unknown template "${template}". Available templates: ${AVAILABLE_TEMPLATES.join(', ')}`);
  }

  const templateDir = path.join(__dirname, '..', 'templates', template);
  await copyDirectory(templateDir, targetDir, {
    appName: path.basename(targetDir),
  });

  if (includeVercel) {
    const vercelDir = path.join(__dirname, '..', 'templates', 'vercel');
    await copyDirectory(vercelDir, targetDir, {
      appName: path.basename(targetDir),
    });
  }

  if (includeApi) {
    const apiDir = path.join(__dirname, '..', 'templates', 'api');
    await copyDirectory(apiDir, path.join(targetDir, 'api'), {
      appName: path.basename(targetDir),
    });
  }
}

async function copyDirectory(sourceDir, destinationDir, context) {
  await fs.mkdir(destinationDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath, context);
    } else {
      await writeFileWithContext(sourcePath, destinationPath, context);
    }
  }
}

async function writeFileWithContext(sourcePath, destinationPath, context) {
  const content = await fs.readFile(sourcePath, 'utf8');
  const parsed = applyContext(content, context);
  await fs.writeFile(destinationPath, parsed, 'utf8');
}

function applyContext(content, context) {
  const safeName = sanitizeName(context.appName);
  return content
    .replace(/__APP_NAME__/g, safeName)
    .replace(/__APP_TITLE__/g, titleCase(context.appName));
}

function sanitizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
}

function titleCase(name) {
  return name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function printSuccess(targetDir, options) {
  const relativeTarget = path.relative(process.cwd(), targetDir) || '.';
  const lines = [
    `✔ Project created at ${targetDir}`,
    '',
    'Next steps:',
    `  1. cd ${relativeTarget}`,
    '  2. npm install --global vercel (if you want to deploy)',
    '  3. npm run dev   # serves the static site with npx serve',
  ];

  if (options.vercel) {
    lines.push('  4. vercel deploy   # deploys using the generated vercel.json');
  }

  console.log(lines.join('\n'));
}
