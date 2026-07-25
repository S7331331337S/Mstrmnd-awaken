import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { initCommand } from '../commands/init.js';
import { devCommand } from '../commands/dev.js';
import { buildCommand } from '../commands/build.js';
import { deployCommand } from '../commands/deploy.js';
import { configCommand } from '../commands/config.js';

describe('CLI commands registration', () => {
  it('initCommand returns a Command named "init"', () => {
    const cmd = initCommand();
    assert.equal(cmd.name(), 'init');
  });

  it('devCommand returns a Command named "dev"', () => {
    const cmd = devCommand();
    assert.equal(cmd.name(), 'dev');
  });

  it('buildCommand returns a Command named "build"', () => {
    const cmd = buildCommand();
    assert.equal(cmd.name(), 'build');
  });

  it('deployCommand returns a Command named "deploy"', () => {
    const cmd = deployCommand();
    assert.equal(cmd.name(), 'deploy');
  });

  it('configCommand returns a Command named "config"', () => {
    const cmd = configCommand();
    assert.equal(cmd.name(), 'config');
  });

  it('init command has expected options', () => {
    const cmd = initCommand();
    const optionNames = cmd.options.map((o) => o.long);
    assert.ok(optionNames.includes('--template'));
    assert.ok(optionNames.includes('--yes'));
  });

  it('deploy command has expected options', () => {
    const cmd = deployCommand();
    const optionNames = cmd.options.map((o) => o.long);
    assert.ok(optionNames.includes('--prod'));
    assert.ok(optionNames.includes('--token'));
  });

  it('dev command has --port option', () => {
    const cmd = devCommand();
    const optionNames = cmd.options.map((o) => o.long);
    assert.ok(optionNames.includes('--port'));
  });

  it('config command has sub-commands: show, set, set-ai, set-vercel', () => {
    const cmd = configCommand();
    const subCmds = cmd.commands.map((c) => c.name());
    assert.ok(subCmds.includes('show'));
    assert.ok(subCmds.includes('set'));
    assert.ok(subCmds.includes('set-ai'));
    assert.ok(subCmds.includes('set-vercel'));
  });
});
