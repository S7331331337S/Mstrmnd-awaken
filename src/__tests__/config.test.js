import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { readConfig, writeConfig, requireConfig } from '../lib/config.js';

describe('config helpers', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'mstrmnd-test-'));
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('readConfig returns null when no config file exists', () => {
    const result = readConfig(tmpDir);
    assert.equal(result, null);
  });

  it('writeConfig creates a valid JSON file', () => {
    const config = { name: 'test-app', template: 'nextjs' };
    writeConfig(config, tmpDir);
    const result = readConfig(tmpDir);
    assert.deepEqual(result, config);
  });

  it('readConfig parses the config correctly', () => {
    const config = { name: 'my-app', template: 'react', version: '1.0.0' };
    writeConfig(config, tmpDir);
    const result = readConfig(tmpDir);
    assert.equal(result.name, 'my-app');
    assert.equal(result.template, 'react');
    assert.equal(result.version, '1.0.0');
  });

  it('requireConfig throws when no config file present', () => {
    const emptyDir = mkdtempSync(join(tmpdir(), 'mstrmnd-empty-'));
    try {
      assert.throws(
        () => requireConfig(emptyDir),
        /mstrmnd\.config\.json/
      );
    } finally {
      rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  it('requireConfig returns config when file exists', () => {
    const config = { name: 'my-app', template: 'nextjs' };
    writeConfig(config, tmpDir);
    const result = requireConfig(tmpDir);
    assert.deepEqual(result, config);
  });

  it('readConfig returns null on malformed JSON', () => {
    const badDir = mkdtempSync(join(tmpdir(), 'mstrmnd-bad-'));
    try {
      writeFileSync(join(badDir, 'mstrmnd.config.json'), '{ not valid json }', 'utf8');
      const result = readConfig(badDir);
      assert.equal(result, null);
    } finally {
      rmSync(badDir, { recursive: true, force: true });
    }
  });
});
