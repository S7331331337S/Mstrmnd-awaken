import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateName } from './config';

const SHARED_GITIGNORE = `# Dependencies
node_modules/

# Build
.next/
out/
dist/
build/

# Env
.env
.env*.local

# Vercel
.vercel

# Logs / OS / TS
*.log
.DS_Store
*.tsbuildinfo
next-env.d.ts
`;

export async function scaffoldProject(
  projectPath: string,
  projectName: string,
  template: TemplateName,
  aiEnabled: boolean
): Promise<void> {
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'public'));
  await fs.ensureDir(path.join(projectPath, 'src'));

  if (template === 'nextjs') {
    await scaffoldNext(projectPath, projectName, aiEnabled);
  } else if (template === 'react') {
    await scaffoldReact(projectPath, projectName, aiEnabled);
  } else {
    await scaffoldVue(projectPath, projectName, aiEnabled);
  }

  await fs.writeFile(path.join(projectPath, '.gitignore'), SHARED_GITIGNORE.trim() + '\n');

  if (aiEnabled) {
    await fs.writeFile(
      path.join(projectPath, '.env.example'),
      `# Copy to .env.local and fill in your key\nOPENAI_API_KEY=\n`
    );
  }

  await fs.writeFile(
    path.join(projectPath, 'README.md'),
    generateProjectReadme(projectName, template, aiEnabled)
  );
}

function generateProjectReadme(
  name: string,
  template: TemplateName,
  aiEnabled: boolean
): string {
  return `# ${name}

Scaffolded with [Mstrmnd CLI](https://github.com/S7331331337S/Mstrmnd-awaken) (${template}).

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

${
  aiEnabled
    ? `## AI

Copy \`.env.example\` to \`.env.local\` and set \`OPENAI_API_KEY\`.
`
    : ''
}
## Scripts

- \`npm run dev\` — development server
- \`npm run build\` — production build
- \`mstrmnd deploy\` — deploy with the Mstrmnd CLI (uses Vercel)
`;
}

async function scaffoldNext(
  projectPath: string,
  projectName: string,
  aiEnabled: boolean
): Promise<void> {
  const appDir = path.join(projectPath, 'src', 'app');
  await fs.ensureDir(appDir);

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '^14.2.5',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      ...(aiEnabled ? { openai: '^4.52.0' } : {}),
    },
    devDependencies: {
      '@types/node': '^20.14.0',
      '@types/react': '^18.3.3',
      '@types/react-dom': '^18.3.0',
      typescript: '^5.5.0',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  await fs.writeJson(
    path.join(projectPath, 'tsconfig.json'),
    {
      compilerOptions: {
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./src/*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    { spaces: 2 }
  );

  await fs.writeFile(
    path.join(projectPath, 'next.config.mjs'),
    `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\n\nexport default nextConfig;\n`
  );

  await fs.writeFile(
    path.join(appDir, 'globals.css'),
    `:root {
  color-scheme: light;
  --bg: #f4f7fb;
  --ink: #0f172a;
  --muted: #475569;
  --accent: #0e7490;
  --panel: #ffffff;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  min-height: 100%;
  font-family: "Segoe UI", "Helvetica Neue", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(14, 116, 144, 0.18), transparent 40%),
    linear-gradient(180deg, #eef5fb 0%, var(--bg) 55%, #e8eef6 100%);
  color: var(--ink);
}

main {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.hero {
  width: min(40rem, 100%);
  background: color-mix(in srgb, var(--panel) 88%, transparent);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.25rem;
  padding: 2.5rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 4vw, 2.75rem);
  letter-spacing: -0.03em;
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
  font-size: 1.05rem;
}
`
  );

  await fs.writeFile(
    path.join(appDir, 'layout.tsx'),
    `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Built with Mstrmnd CLI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
  );

  await fs.writeFile(
    path.join(appDir, 'page.tsx'),
    `export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>${projectName}</h1>
        <p>
          Next.js app scaffolded by Mstrmnd CLI
          ${aiEnabled ? 'with OpenAI integration ready to wire up.' : 'ready for local development.'}
        </p>
      </section>
    </main>
  );
}
`
  );

  if (aiEnabled) {
    const apiDir = path.join(appDir, 'api', 'chat');
    await fs.ensureDir(apiDir);
    await fs.writeFile(
      path.join(apiDir, 'route.ts'),
      `import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY in .env.local' },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { prompt?: string };
  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  return NextResponse.json({
    reply: completion.choices[0]?.message?.content ?? '',
  });
}
`
    );
  }
}

async function scaffoldReact(
  projectPath: string,
  projectName: string,
  aiEnabled: boolean
): Promise<void> {
  const srcDir = path.join(projectPath, 'src');

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc --noEmit && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      ...(aiEnabled ? { openai: '^4.52.0' } : {}),
    },
    devDependencies: {
      '@types/react': '^18.3.3',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.3.1',
      typescript: '^5.5.0',
      vite: '^5.3.0',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  await fs.writeJson(
    path.join(projectPath, 'tsconfig.json'),
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src'],
    },
    { spaces: 2 }
  );

  await fs.writeJson(
    path.join(projectPath, 'tsconfig.node.json'),
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2023'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        strict: true,
      },
      include: ['vite.config.ts'],
    },
    { spaces: 2 }
  );

  await fs.writeFile(
    path.join(projectPath, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`
  );

  await fs.writeFile(
    path.join(projectPath, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  await fs.writeFile(
    path.join(srcDir, 'main.tsx'),
    `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
  );

  await fs.writeFile(
    path.join(srcDir, 'App.tsx'),
    `export default function App() {
  return (
    <main>
      <section className="hero">
        <h1>${projectName}</h1>
        <p>
          React + Vite app scaffolded by Mstrmnd CLI
          ${aiEnabled ? 'with OpenAI client helpers included.' : 'ready for local development.'}
        </p>
      </section>
    </main>
  );
}
`
  );

  await fs.writeFile(
    path.join(srcDir, 'index.css'),
    `:root {
  color-scheme: light;
  --bg: #f7f4ef;
  --ink: #1c1917;
  --muted: #57534e;
  --accent: #b45309;
}

* { box-sizing: border-box; }

html, body, #root {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: "Iowan Old Style", "Palatino Linotype", Palatino, serif;
  background:
    radial-gradient(circle at 20% 10%, rgba(180, 83, 9, 0.16), transparent 35%),
    linear-gradient(160deg, #fbf8f3, var(--bg));
  color: var(--ink);
}

main {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.hero {
  width: min(38rem, 100%);
  padding: 2rem;
  border-left: 4px solid var(--accent);
}

h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2.2rem, 5vw, 3rem);
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
  font-size: 1.1rem;
}
`
  );

  await fs.writeFile(
    path.join(srcDir, 'vite-env.d.ts'),
    `/// <reference types="vite/client" />
`
  );

  if (aiEnabled) {
    await fs.ensureDir(path.join(srcDir, 'lib'));
    await fs.writeFile(
      path.join(srcDir, 'lib', 'ai.ts'),
      `/**
 * OpenAI is included as a dependency.
 * Call it from a server/API route — do not put secret API keys in Vite client code.
 */
export function assertServerSideAi() {
  throw new Error(
    'Use a backend endpoint for OpenAI. Client bundles must not embed OPENAI_API_KEY.'
  );
}
`
    );
  }
}

async function scaffoldVue(
  projectPath: string,
  projectName: string,
  aiEnabled: boolean
): Promise<void> {
  const srcDir = path.join(projectPath, 'src');

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vue-tsc --noEmit && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      vue: '^3.4.31',
      ...(aiEnabled ? { openai: '^4.52.0' } : {}),
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.0.5',
      typescript: '^5.5.0',
      vite: '^5.3.0',
      'vue-tsc': '^2.0.26',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  await fs.writeJson(
    path.join(projectPath, 'tsconfig.json'),
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: 'force',
        noEmit: true,
        jsx: 'preserve',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
    },
    { spaces: 2 }
  );

  await fs.writeFile(
    path.join(projectPath, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
`
  );

  await fs.writeFile(
    path.join(projectPath, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`
  );

  await fs.writeFile(
    path.join(srcDir, 'main.ts'),
    `import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
`
  );

  await fs.writeFile(
    path.join(srcDir, 'App.vue'),
    `<template>
  <main>
    <section class="hero">
      <h1>${projectName}</h1>
      <p>
        Vue + Vite app scaffolded by Mstrmnd CLI
        ${aiEnabled ? 'with OpenAI client helpers included.' : 'ready for local development.'}
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
</script>
`
  );

  await fs.writeFile(
    path.join(srcDir, 'style.css'),
    `:root {
  color-scheme: light;
  --bg: #f3faf6;
  --ink: #052e16;
  --muted: #166534;
  --accent: #15803d;
}

* { box-sizing: border-box; }

html, body, #app {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: "Avenir Next", "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at 80% 0%, rgba(21, 128, 61, 0.18), transparent 40%),
    linear-gradient(180deg, #ecfdf5, var(--bg));
  color: var(--ink);
}

main {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.hero {
  width: min(38rem, 100%);
  padding: 2rem 2.25rem;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 1rem;
  border: 1px solid rgba(5, 46, 22, 0.08);
}

h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 4vw, 2.8rem);
}

p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}
`
  );

  if (aiEnabled) {
    await fs.ensureDir(path.join(srcDir, 'lib'));
    await fs.writeFile(
      path.join(srcDir, 'lib', 'ai.ts'),
      `/**
 * OpenAI is included as a dependency.
 * Call it from a server/API route — do not put secret API keys in Vite client code.
 */
export function assertServerSideAi() {
  throw new Error(
    'Use a backend endpoint for OpenAI. Client bundles must not embed OPENAI_API_KEY.'
  );
}
`
    );
  }

  await fs.writeFile(
    path.join(srcDir, 'vite-env.d.ts'),
    `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
`
  );
}
