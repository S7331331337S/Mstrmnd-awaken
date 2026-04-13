import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

import { initCommand } from './commands/init.js';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { deployCommand } from './commands/deploy.js';
import { configCommand } from './commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

program
  .name('mstrmnd')
  .description('CLI for web dev Mstrmnd AI — scaffold, develop, and deploy AI-powered web projects to Vercel')
  .version(pkg.version);

program.addCommand(initCommand());
program.addCommand(devCommand());
program.addCommand(buildCommand());
program.addCommand(deployCommand());
program.addCommand(configCommand());

program.parse(process.argv);
