import * as fs from 'fs-extra';
import * as path from 'path';

export type TemplateName = 'nextjs' | 'react' | 'vue';

export interface MstrmndConfig {
  projectName: string;
  template: TemplateName;
  aiEnabled: boolean;
  ai?: {
    apiKeyEnvVar?: string;
    model?: string;
  };
  vercel?: {
    projectId?: string;
    orgId?: string;
  };
}

export const CONFIG_FILE = 'mstrmnd.config.json';
export const VALID_TEMPLATES: TemplateName[] = ['nextjs', 'react', 'vue'];

export function isTemplateName(value: string): value is TemplateName {
  return (VALID_TEMPLATES as string[]).includes(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  updates: Partial<T>
): T {
  const result: Record<string, unknown> = { ...target };

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;

    const existing = result[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = deepMerge(existing, value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

export async function loadConfig(cwd: string = process.cwd()): Promise<MstrmndConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILE);

  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  try {
    const raw = await fs.readJson(configPath);
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as MstrmndConfig;
  } catch {
    return null;
  }
}

export async function saveConfig(
  config: MstrmndConfig,
  cwd: string = process.cwd()
): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function updateConfig(
  updates: Partial<MstrmndConfig>,
  cwd: string = process.cwd()
): Promise<MstrmndConfig> {
  const config = await loadConfig(cwd);

  if (!config) {
    throw new Error('No Mstrmnd configuration found. Run "mstrmnd init" first.');
  }

  const updatedConfig = deepMerge(
    config as unknown as Record<string, unknown>,
    updates as unknown as Partial<Record<string, unknown>>
  ) as unknown as MstrmndConfig;

  await saveConfig(updatedConfig, cwd);
  return updatedConfig;
}

export async function requireConfig(cwd: string = process.cwd()): Promise<MstrmndConfig> {
  const config = await loadConfig(cwd);
  if (!config) {
    throw new Error('No mstrmnd.config.json found. Run `mstrmnd init` to set up your project.');
  }
  return config;
}

export function getConfigValue(config: MstrmndConfig, key: string): unknown {
  const parts = key.split('.').filter(Boolean);
  let current: unknown = config;

  for (const part of parts) {
    if (!isPlainObject(current) || !(part in current)) {
      throw new Error(`Configuration key not found: ${key}`);
    }
    current = current[part];
  }

  return current;
}

export function setConfigPath(
  config: MstrmndConfig,
  key: string,
  value: unknown
): MstrmndConfig {
  const parts = key.split('.').filter(Boolean);
  if (parts.length === 0) {
    throw new Error('Configuration key is required');
  }

  const updates: Record<string, unknown> = {};
  let cursor = updates;

  for (let i = 0; i < parts.length - 1; i++) {
    const next: Record<string, unknown> = {};
    cursor[parts[i]] = next;
    cursor = next;
  }

  cursor[parts[parts.length - 1]] = value;

  return deepMerge(
    config as unknown as Record<string, unknown>,
    updates
  ) as unknown as MstrmndConfig;
}

export function parseConfigValue(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return value;
}
