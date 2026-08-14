import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import {
  deepMerge,
  loadConfig,
  saveConfig,
  updateConfig,
  getConfigValue,
  setConfigPath,
  parseConfigValue,
  isTemplateName,
  MstrmndConfig,
} from '../utils/config';
import { parseEnvFile } from '../utils/process';
import { scaffoldProject } from '../utils/templates';

describe('config helpers', () => {
  let tmpDir: string;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'mstrmnd-config-'));
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('deepMerge preserves nested sibling fields', () => {
    const merged = deepMerge(
      {
        projectName: 'app',
        vercel: { projectId: 'p1', orgId: 'o1' },
      } as Record<string, unknown>,
      {
        vercel: { projectId: 'p2' },
      } as Record<string, unknown>
    );

    assert.equal(merged.projectName, 'app');
    assert.deepEqual(merged.vercel, { projectId: 'p2', orgId: 'o1' });
  });

  it('isTemplateName validates known templates', () => {
    assert.equal(isTemplateName('nextjs'), true);
    assert.equal(isTemplateName('svelte'), false);
  });

  it('save/load round-trips config', async () => {
    const config: MstrmndConfig = {
      projectName: 'demo',
      template: 'react',
      aiEnabled: true,
      ai: { apiKeyEnvVar: 'OPENAI_API_KEY', model: 'gpt-4o-mini' },
    };

    await saveConfig(config, tmpDir);
    const loaded = await loadConfig(tmpDir);
    assert.deepEqual(loaded, config);
  });

  it('updateConfig deep-merges vercel metadata', async () => {
    await saveConfig(
      {
        projectName: 'demo',
        template: 'nextjs',
        aiEnabled: false,
        vercel: { projectId: 'old', orgId: 'org' },
      },
      tmpDir
    );

    const updated = await updateConfig({ vercel: { projectId: 'new' } }, tmpDir);
    assert.equal(updated.vercel?.projectId, 'new');
    assert.equal(updated.vercel?.orgId, 'org');
  });

  it('getConfigValue and setConfigPath support dot paths', () => {
    const config: MstrmndConfig = {
      projectName: 'demo',
      template: 'vue',
      aiEnabled: true,
      ai: { model: 'gpt-4o-mini' },
    };

    assert.equal(getConfigValue(config, 'ai.model'), 'gpt-4o-mini');
    const next = setConfigPath(config, 'ai.model', 'gpt-4o');
    assert.equal(next.ai?.model, 'gpt-4o');
    assert.equal(config.ai?.model, 'gpt-4o-mini');
  });

  it('parseConfigValue coerces booleans and numbers', () => {
    assert.equal(parseConfigValue('true'), true);
    assert.equal(parseConfigValue('false'), false);
    assert.equal(parseConfigValue('42'), 42);
    assert.equal(parseConfigValue('hello'), 'hello');
  });

  it('loadConfig returns null for missing or invalid JSON', async () => {
    const empty = mkdtempSync(join(tmpdir(), 'mstrmnd-empty-'));
    const bad = mkdtempSync(join(tmpdir(), 'mstrmnd-bad-'));
    try {
      assert.equal(await loadConfig(empty), null);
      writeFileSync(join(bad, 'mstrmnd.config.json'), '{not-json', 'utf8');
      assert.equal(await loadConfig(bad), null);
    } finally {
      rmSync(empty, { recursive: true, force: true });
      rmSync(bad, { recursive: true, force: true });
    }
  });
});

describe('parseEnvFile', () => {
  it('parses keys, comments, quotes, and equals in values', () => {
    const parsed = parseEnvFile(`
# comment
FOO=bar
export BAR="a=b"
BAZ='x y'
EMPTY=
`);
    assert.equal(parsed.FOO, 'bar');
    assert.equal(parsed.BAR, 'a=b');
    assert.equal(parsed.BAZ, 'x y');
    assert.equal(parsed.EMPTY, '');
  });
});

describe('scaffoldProject', () => {
  it('creates a runnable Next.js layout with optional AI route', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mstrmnd-next-'));
    const projectPath = join(dir, 'app');
    try {
      await scaffoldProject(projectPath, 'app', 'nextjs', true);
      assert.ok(existsSync(join(projectPath, 'package.json')));
      assert.ok(existsSync(join(projectPath, 'src/app/page.tsx')));
      assert.ok(existsSync(join(projectPath, 'src/app/api/chat/route.ts')));
      assert.ok(existsSync(join(projectPath, '.env.example')));
      const pkg = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf8'));
      assert.equal(pkg.dependencies.next.includes('14'), true);
      assert.ok(pkg.dependencies.openai);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('creates React and Vue Vite projects with tsconfig and entrypoints', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mstrmnd-vite-'));
    try {
      const reactPath = join(dir, 'react-app');
      const vuePath = join(dir, 'vue-app');
      await scaffoldProject(reactPath, 'react-app', 'react', false);
      await scaffoldProject(vuePath, 'vue-app', 'vue', true);

      assert.ok(existsSync(join(reactPath, 'vite.config.ts')));
      assert.ok(existsSync(join(reactPath, 'src/main.tsx')));
      assert.ok(existsSync(join(reactPath, 'tsconfig.json')));
      assert.equal(existsSync(join(reactPath, 'src/lib/ai.ts')), false);

      assert.ok(existsSync(join(vuePath, 'src/App.vue')));
      assert.ok(existsSync(join(vuePath, 'src/lib/ai.ts')));
      assert.ok(existsSync(join(vuePath, '.env.example')));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
