# Mstrmnd CLI

TypeScript CLI for scaffolding, developing, and deploying Mstrmnd web projects.

## Features

- Scaffold Next.js, React (Vite), or Vue (Vite) projects
- Optional OpenAI stubs (Next.js API route; dependency + guidance for Vite)
- `dev` / `build` wrappers that respect `mstrmnd.config.json`
- Vercel deploy via local `vercel` or `npx vercel` (no forced global install)
- Config get/set/list with deep-merge for nested keys

## Requirements

- Node.js >= 18
- npm

## Install

```bash
npm install -g mstrmnd-cli
```

Local development:

```bash
git clone https://github.com/S7331331337S/Mstrmnd-awaken.git
cd Mstrmnd-awaken
npm install
npm run build
npm link
```

## Commands

### init

```bash
mstrmnd init
mstrmnd init my-app --template nextjs --ai
mstrmnd init my-app -t react -y
```

| Option | Description |
|--------|-------------|
| `-t, --template` | `nextjs`, `react`, or `vue` |
| `--ai` | Include OpenAI stubs |
| `-y, --yes` | Skip prompts |

### dev

```bash
mstrmnd dev
mstrmnd dev --port 8080 --host 0.0.0.0
```

### build

```bash
mstrmnd build
mstrmnd build --analyze   # sets ANALYZE=true for Next setups that support it
```

### deploy

```bash
mstrmnd deploy
mstrmnd deploy --prod --env .env.production -y
```

Uses `vercel` when available, otherwise `npx vercel`. Does not install packages globally.

### config

```bash
mstrmnd config
mstrmnd config get projectName
mstrmnd config set ai.model gpt-4o-mini
```

## Generated layout

Next.js:

```
my-app/
├── src/app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/chat/route.ts   # when --ai
├── package.json
├── tsconfig.json
├── next.config.mjs
├── mstrmnd.config.json
└── .env.example            # when --ai
```

React / Vue (Vite):

```
my-app/
├── src/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
└── mstrmnd.config.json
```

## Configuration

`mstrmnd.config.json`:

```json
{
  "projectName": "my-app",
  "template": "nextjs",
  "aiEnabled": true,
  "ai": {
    "apiKeyEnvVar": "OPENAI_API_KEY",
    "model": "gpt-4o-mini"
  },
  "vercel": {
    "projectId": "...",
    "orgId": "..."
  }
}
```

## AI notes

- Next.js `--ai` adds `openai`, `.env.example`, and `src/app/api/chat/route.ts`.
- React/Vue `--ai` adds the `openai` dependency and a stub that points you at a backend — do not put secret keys in Vite client code.
- Set `OPENAI_API_KEY` in `.env.local` (Next.js) before calling the sample route.

## Development

```bash
npm install
npm run build
npm test
npm run dev    # tsc --watch
```

## License

MIT
