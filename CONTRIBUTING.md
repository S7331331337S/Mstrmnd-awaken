# Contributing

## Setup

```bash
git clone https://github.com/S7331331337S/Mstrmnd-awaken.git
cd Mstrmnd-awaken
npm install
npm run build
npm link
```

## Layout

```
bin/                 CLI entry (requires dist/)
src/
  commands/          init, dev, build, deploy, config
  utils/             config, logger, process, templates
  __tests__/         node:test suites (compiled with tsc)
dist/                build output
```

This project is TypeScript-only. Do not add parallel JavaScript implementations under `src/`.

## Workflow

1. Branch from `main`
2. Edit `src/`
3. `npm run build && npm test`
4. Manually smoke-test: `mstrmnd init tmp-app -t nextjs -y --ai`
5. Open a PR with a clear summary

## Style

- Prefer small, single-purpose modules
- Avoid `shell: true` in process spawns unless required
- Keep scaffolds runnable without extra manual file creation
- Deep-merge nested config updates

## Tests

```bash
npm test
```

Tests compile with `tsc`, then run via `node --test` against `dist/__tests__`.
