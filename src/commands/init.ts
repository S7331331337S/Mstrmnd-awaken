import inquirer from 'inquirer';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger, formatTitle } from '../utils/logger';
import { saveConfig, MstrmndConfig } from '../utils/config';

interface InitOptions {
  template?: string;
  ai?: boolean;
}

export async function initCommand(projectName?: string, options?: InitOptions) {
  console.log(formatTitle('🚀 Mstrmnd AI Web Development CLI'));

  let name = projectName;
  let template = options?.template || 'nextjs';
  let aiEnabled = options?.ai || false;

  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-mstrmnd-app',
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-z0-9-_]+$/i.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: [
          { name: 'Next.js (Recommended)', value: 'nextjs' },
          { name: 'React', value: 'react' },
          { name: 'Vue', value: 'vue' },
        ],
        default: 'nextjs',
      },
      {
        type: 'confirm',
        name: 'aiEnabled',
        message: 'Include AI integration?',
        default: true,
      },
    ]);

    name = answers.projectName;
    template = answers.template;
    aiEnabled = answers.aiEnabled;
  }

  const projectPath = path.join(process.cwd(), name!);

  if (await fs.pathExists(projectPath)) {
    logger.error(`Directory "${name}" already exists!`);
    process.exit(1);
  }

  const spinner = ora('Creating project structure...').start();

  try {
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'src'));
    await fs.ensureDir(path.join(projectPath, 'public'));

    const packageJson: any = {
      name,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'mstrmnd dev',
        build: 'mstrmnd build',
        deploy: 'mstrmnd deploy',
      },
      dependencies: {},
      devDependencies: {},
    };

    if (template === 'nextjs') {
      packageJson.scripts.dev = 'next dev';
      packageJson.scripts.build = 'next build';
      packageJson.scripts.start = 'next start';
      packageJson.dependencies = {
        next: '^14.1.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...(aiEnabled && { openai: '^4.28.0' }),
      };
      packageJson.devDependencies = {
        '@types/node': '^20.11.0',
        '@types/react': '^18.2.48',
        '@types/react-dom': '^18.2.18',
        typescript: '^5.3.3',
      };

      await createNextJsFiles(projectPath, aiEnabled);
    } else if (template === 'react') {
      packageJson.scripts = {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
      };
      packageJson.dependencies = {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        ...(aiEnabled && { openai: '^4.28.0' }),
      };
      packageJson.devDependencies = {
        '@types/react': '^18.2.48',
        '@types/react-dom': '^18.2.18',
        '@vitejs/plugin-react': '^4.2.1',
        typescript: '^5.3.3',
        vite: '^5.0.11',
      };

      await createReactFiles(projectPath, aiEnabled);
    } else if (template === 'vue') {
      packageJson.scripts = {
        dev: 'vite',
        build: 'vue-tsc && vite build',
        preview: 'vite preview',
      };
      packageJson.dependencies = {
        vue: '^3.4.15',
        ...(aiEnabled && { openai: '^4.28.0' }),
      };
      packageJson.devDependencies = {
        '@vitejs/plugin-vue': '^5.0.3',
        typescript: '^5.3.3',
        'vue-tsc': '^1.8.27',
        vite: '^5.0.11',
      };

      await createVueFiles(projectPath, aiEnabled);
    }

    await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

    const config: MstrmndConfig = {
      projectName: name!,
      template,
      aiEnabled,
    };

    await saveConfig(config, projectPath);

    const gitignore = `
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore.trim());

    spinner.succeed('Project structure created!');

    logger.success(`\nProject "${name}" initialized successfully!\n`);
    logger.info('Next steps:\n');
    logger.command(`cd ${name}`);
    logger.command('npm install');
    logger.command('npm run dev\n');

    if (aiEnabled) {
      logger.warning('Remember to set up your AI API keys in .env.local');
    }
  } catch (error) {
    spinner.fail('Failed to create project');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function createNextJsFiles(projectPath: string, aiEnabled: boolean) {
  const appDir = path.join(projectPath, 'src', 'app');
  await fs.ensureDir(appDir);

  const pageContent = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Mstrmnd AI
        </h1>
        <p className="text-xl text-gray-600">
          Your Next.js project with ${aiEnabled ? 'AI integration' : 'modern web development'}
        </p>
      </div>
    </main>
  );
}
`;

  const layoutContent = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mstrmnd AI App',
  description: 'Built with Mstrmnd AI CLI',
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
`;

  await fs.writeFile(path.join(appDir, 'page.tsx'), pageContent);
  await fs.writeFile(path.join(appDir, 'layout.tsx'), layoutContent);

  const tsConfig = {
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
  };

  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

  if (aiEnabled) {
    const envExample = `# OpenAI API Key
OPENAI_API_KEY=your_api_key_here
`;
    await fs.writeFile(path.join(projectPath, '.env.example'), envExample);
  }
}

async function createReactFiles(projectPath: string, aiEnabled: boolean) {
  const srcDir = path.join(projectPath, 'src');

  const appContent = `import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Mstrmnd AI</h1>
        <p>Your React project with ${aiEnabled ? 'AI integration' : 'modern web development'}</p>
      </header>
    </div>
  );
}

export default App;
`;

  const mainContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mstrmnd AI App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(srcDir, 'App.tsx'), appContent);
  await fs.writeFile(path.join(srcDir, 'main.tsx'), mainContent);
  await fs.writeFile(path.join(srcDir, 'App.css'), '');
  await fs.writeFile(path.join(srcDir, 'index.css'), '');
  await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml);

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;

  await fs.writeFile(path.join(projectPath, 'vite.config.ts'), viteConfig);
}

async function createVueFiles(projectPath: string, aiEnabled: boolean) {
  const srcDir = path.join(projectPath, 'src');

  const appContent = `<template>
  <div id="app">
    <header>
      <h1>Welcome to Mstrmnd AI</h1>
      <p>Your Vue project with ${aiEnabled ? 'AI integration' : 'modern web development'}</p>
    </header>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
header {
  text-align: center;
  padding: 2rem;
}
</style>
`;

  const mainContent = `import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mstrmnd AI App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(srcDir, 'App.vue'), appContent);
  await fs.writeFile(path.join(srcDir, 'main.ts'), mainContent);
  await fs.writeFile(path.join(srcDir, 'style.css'), '');
  await fs.writeFile(path.join(projectPath, 'index.html'), indexHtml);

  const viteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
`;

  await fs.writeFile(path.join(projectPath, 'vite.config.ts'), viteConfig);
}
