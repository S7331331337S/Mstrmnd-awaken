import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_FILE = 'mstrmnd.config.json';

export function readConfig(cwd = process.cwd()) {
  const configPath = join(cwd, CONFIG_FILE);
  if (!existsSync(configPath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    return null;
  }
}

export function writeConfig(config, cwd = process.cwd()) {
  const configPath = join(cwd, CONFIG_FILE);
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

export function requireConfig(cwd = process.cwd()) {
  const config = readConfig(cwd);
  if (!config) {
    throw new Error(
      'No mstrmnd.config.json found. Run `mstrmnd init` to set up your project.'
    );
  }
  return config;
}
