# Mstrmnd AI CLI - Contributing Guide

Thank you for your interest in contributing to Mstrmnd AI CLI!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/S7331331337S/Mstrmnd-awaken.git
   cd Mstrmnd-awaken
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Link for local testing:
   ```bash
   npm link
   ```

## Project Structure

```
├── bin/              # CLI executable entry point
├── src/              # TypeScript source code
│   ├── commands/     # CLI commands (init, dev, build, deploy, config)
│   └── utils/        # Utility functions (logger, config)
├── dist/             # Compiled JavaScript (generated)
└── package.json      # Package configuration
```

## Making Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the `src/` directory

3. Build and test:
   ```bash
   npm run build
   mstrmnd --help  # Test the CLI
   ```

4. Commit your changes with a descriptive message

5. Push and create a pull request

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add type definitions where appropriate
- Keep functions focused and single-purpose

## Testing

Before submitting a PR, test all CLI commands:

```bash
# Test init command
mstrmnd init test-project --template nextjs --ai

# Test help
mstrmnd --help
mstrmnd init --help
```

## Pull Request Process

1. Update README.md if you're adding new features
2. Ensure the build succeeds (`npm run build`)
3. Write clear commit messages
4. Reference any related issues in your PR description

Thank you for contributing!
