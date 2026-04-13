import * as fs from 'fs-extra';
import * as path from 'path';

export interface MstrmndConfig {
  projectName: string;
  template: string;
  aiEnabled: boolean;
  vercel?: {
    projectId?: string;
    orgId?: string;
  };
}

const CONFIG_FILE = 'mstrmnd.config.json';

export async function loadConfig(cwd: string = process.cwd()): Promise<MstrmndConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILE);

  if (await fs.pathExists(configPath)) {
    return await fs.readJson(configPath);
  }

  return null;
}

export async function saveConfig(config: MstrmndConfig, cwd: string = process.cwd()): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function updateConfig(
  updates: Partial<MstrmndConfig>,
  cwd: string = process.cwd()
): Promise<void> {
  const config = await loadConfig(cwd);

  if (!config) {
    throw new Error('No Mstrmnd configuration found. Run "mstrmnd init" first.');
  }

  const updatedConfig = { ...config, ...updates };
  await saveConfig(updatedConfig, cwd);
}
