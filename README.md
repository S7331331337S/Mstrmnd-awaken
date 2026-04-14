# Mstrmnd-awaken

CLI for web dev Mstrmnd AI — scaffold, develop, and deploy AI-powered web projects to Vercel.

## Installation

```bash
npm install -g mstrmnd-awaken
```

Or use directly with `npx`:

```bash
npx mstrmnd-awaken init my-app
```

## Commands

| Command | Description |
|---|---|
| `mstrmnd init [name]` | Scaffold a new Mstrmnd AI web project |
| `mstrmnd dev` | Start the local development server |
| `mstrmnd build` | Build the project for production |
| `mstrmnd deploy` | Deploy to Vercel |
| `mstrmnd config show` | Display project configuration |
| `mstrmnd config set <key> <value>` | Update a configuration value |
| `mstrmnd config set-ai` | Configure AI settings |
| `mstrmnd config set-vercel` | Configure Vercel deployment settings |

## Quick Start

```bash
# Create a new project
mstrmnd init my-app

# Enter the project directory
cd my-app

# Set your Mstrmnd AI API key
cp .env.example .env.local
# Edit .env.local and set MSTRMND_API_KEY

# Start development server
mstrmnd dev

# Deploy to Vercel (preview)
mstrmnd deploy

# Deploy to Vercel (production)
mstrmnd deploy --prod
```

## Supported Templates

- **nextjs** — Next.js (App Router)
- **react** — React + Vite
- **svelte** — SvelteKit
- **astro** — Astro

## Configuration

Project settings are stored in `mstrmnd.config.json` at the root of your project.

```json
{
  "name": "my-app",
  "template": "nextjs",
  "version": "1.0.0",
  "ai": {
    "apiKeyEnvVar": "MSTRMND_API_KEY",
    "model": "mstrmnd-v1"
  },
  "vercel": {
    "projectId": null,
    "orgId": null
  }
}
```

## Environment Variables

| Variable | Description |
|---|---|
| `MSTRMND_API_KEY` | Your Mstrmnd AI API key |
| `VERCEL_TOKEN` | Vercel authentication token (optional, used by `deploy`) |
