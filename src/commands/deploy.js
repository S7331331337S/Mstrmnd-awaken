import { Command } from 'commander';
import { execSync, spawn } from 'child_process';
import ora from 'ora';
import { log, checkVercelCli } from '../lib/logger.js';
import { requireConfig } from '../lib/config.js';

export function deployCommand() {
  const cmd = new Command('deploy');

  cmd
    .description('Deploy the project to Vercel')
    .option('--prod', 'Deploy to production environment', false)
    .option('--token <token>', 'Vercel authentication token (overrides VERCEL_TOKEN env var)')
    .action(async (options) => {
      let config;
      try {
        config = requireConfig();
      } catch (err) {
        log.error(err.message);
        process.exit(1);
      }

      log.title(`\n🧠 Mstrmnd AI — Deploy to Vercel\n`);

      if (!checkVercelCli()) {
        log.warn('Vercel CLI not found. Installing globally…');
        try {
          execSync('npm install -g vercel', { stdio: 'inherit' });
        } catch {
          log.error('Failed to install Vercel CLI. Please run: npm install -g vercel');
          process.exit(1);
        }
      }

      const cwd = process.cwd();
      const token = options.token || process.env.VERCEL_TOKEN;

      const vercelArgs = ['vercel'];
      if (token) {
        vercelArgs.push('--token', token);
      }
      if (options.prod) {
        vercelArgs.push('--prod');
      }

      const spinner = ora(
        `Deploying ${config.name} to Vercel${options.prod ? ' (production)' : ' (preview)'}…`
      ).start();

      const chunks = [];
      const child = spawn('npx', vercelArgs, {
        cwd,
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env },
      });

      child.stdout.on('data', (d) => chunks.push(d));
      child.stderr.on('data', (d) => chunks.push(d));

      child.on('error', (err) => {
        spinner.fail('Deployment failed');
        log.error(err.message);
        process.exit(1);
      });

      child.on('close', (code) => {
        const output = Buffer.concat(chunks).toString();
        if (code !== 0) {
          spinner.fail('Deployment failed');
          log.error(output);
          process.exit(code || 1);
        }
        spinner.succeed('Deployment successful!');
        const urlMatch = output.match(/https?:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
          log.success(`\nDeployed to: ${urlMatch[0]}\n`);
        } else {
          log.info(output.trim());
        }
      });
    });

  return cmd;
}
