# Mstrmnd Awaken CLI

Command-line helper for spinning up lightweight web starters that are ready for Vercel deployments. Use it to bootstrap a static project, optionally include a sample API route, and ship quickly.

## Setup

Install dependencies after cloning:

```bash
npm install
```

You can run the CLI locally with `npx`:

```bash
npx mstrmnd --help
```

## Create a project

```bash
npx mstrmnd init my-web-app --vercel --api
```

- `--vercel` adds a `vercel.json` tuned for static deployments.
- `--api` adds an `api/hello.js` example for serverless routes.
- `--force` allows overwriting non-empty directories.

Generated projects include:

- A single-page HTML/CSS/JS layout with a stylized hero and idea-capture panel.
- `npm run dev` (via `npx serve .`) for quick local preview.
- Optional Vercel config and API starter.

## Deploy

If you generated `vercel.json`, deploy with:

```bash
vercel deploy
```

Otherwise rerun init with `--vercel` to add the config.
