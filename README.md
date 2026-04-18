# Mstrmnd AI CLI

A powerful command-line interface for Mstrmnd AI web development. Quickly scaffold, develop, build, and deploy modern web applications with AI integration.

## Features

- 🚀 **Quick Project Setup** - Initialize new projects with popular frameworks
- 🤖 **AI Integration** - Optional AI capabilities built-in
- 📦 **Multiple Templates** - Support for Next.js, React, and Vue
- 🔧 **Development Server** - Fast development with hot reload
- 🏗️ **Production Builds** - Optimized builds for deployment
- ☁️ **Vercel Integration** - Seamless deployment to Vercel
- ⚙️ **Configuration Management** - Easy project configuration

## Installation

### Global Installation

```bash
npm install -g mstrmnd-cli
```

### Local Development

```bash
git clone https://github.com/S7331331337S/Mstrmnd-awaken.git
cd Mstrmnd-awaken
npm install
npm run build
npm link
```

## Usage

### Initialize a New Project

Create a new Mstrmnd AI project:

```bash
mstrmnd init [project-name]
```

Interactive mode (recommended):

```bash
mstrmnd init
```

With options:

```bash
mstrmnd init my-app --template nextjs --ai
```

**Options:**
- `-t, --template <template>` - Project template: `nextjs`, `react`, or `vue` (default: `nextjs`)
- `--ai` - Include AI integration setup

### Development Server

Start the development server:

```bash
mstrmnd dev
```

**Options:**
- `-p, --port <port>` - Port to run the server on (default: `3000`)
- `-H, --host <host>` - Host to bind the server to (default: `localhost`)

Example:

```bash
mstrmnd dev --port 8080 --host 0.0.0.0
```

### Build for Production

Build your project for production:

```bash
mstrmnd build
```

**Options:**
- `--analyze` - Analyze the bundle size

### Deploy to Vercel

Deploy your project to Vercel:

```bash
mstrmnd deploy
```

**Options:**
- `--prod` - Deploy to production (default: preview deployment)
- `--env <file>` - Environment variables file

Example:

```bash
mstrmnd deploy --prod --env .env.production
```

### Configuration Management

Manage project configuration:

```bash
# List all configuration
mstrmnd config

# Get a specific value
mstrmnd config get projectName

# Set a configuration value
mstrmnd config set aiEnabled true
```

## Project Structure

After initialization, your project will have the following structure:

### Next.js Template

```
my-app/
├── src/
│   └── app/
│       ├── page.tsx
│       └── layout.tsx
├── public/
├── package.json
├── tsconfig.json
├── mstrmnd.config.json
└── .gitignore
```

### React/Vue Template

```
my-app/
├── src/
│   ├── App.tsx (or App.vue)
│   └── main.tsx (or main.ts)
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── mstrmnd.config.json
└── .gitignore
```

## Configuration File

The `mstrmnd.config.json` file stores project-specific settings:

```json
{
  "projectName": "my-app",
  "template": "nextjs",
  "aiEnabled": true,
  "vercel": {
    "projectId": "...",
    "orgId": "..."
  }
}
```

## AI Integration

When you enable AI integration (`--ai` flag), the CLI will:

1. Add OpenAI SDK to your dependencies
2. Create a `.env.example` file with required environment variables
3. Set up basic AI integration examples

Remember to add your API keys to `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `mstrmnd init [name]` | Initialize a new project |
| `mstrmnd dev` | Start development server |
| `mstrmnd build` | Build for production |
| `mstrmnd deploy` | Deploy to Vercel |
| `mstrmnd config [action] [key] [value]` | Manage configuration |

## Examples

### Create a Next.js app with AI

```bash
mstrmnd init my-ai-app --template nextjs --ai
cd my-ai-app
npm install
mstrmnd dev
```

### Create a React app

```bash
mstrmnd init my-react-app --template react
cd my-react-app
npm install
mstrmnd dev
```

### Build and deploy

```bash
mstrmnd build
mstrmnd deploy --prod
```

## Requirements

- Node.js >= 16.0.0
- npm or yarn

## Development

### Building the CLI

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/S7331331337S/Mstrmnd-awaken/issues).
