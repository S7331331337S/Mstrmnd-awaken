import { Command } from 'commander';
import { execSync } from 'child_process';
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
      const tokenFlag = token ? `--token ${token}` : '';
      const prodFlag = options.prod ? '--prod' : '';

      const vercelArgs = ['vercel', tokenFlag, prodFlag]
        .filter(Boolean)
        .join(' ');

      const spinner = ora(
        `Deploying ${config.name} to Vercel${options.prod ? ' (production)' : ' (preview)'}…`
      ).start();

      try {
        const output = execSync(`npx ${vercelArgs}`, {
          cwd,
          stdio: 'pipe',
          env: { ...process.env },
        }).toString();

        spinner.succeed('Deployment successful!');

        const urlMatch = output.match(/https?:\/\/[^\s]+\.vercel\.app/);
        if (urlMatch) {
          log.success(`\nDeployed to: ${urlMatch[0]}\n`);
        } else {
          log.info(output.trim());
        }
      } catch (err) {
        spinner.fail('Deployment failed');
        const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
        log.error(output);
        process.exit(1);
      }
    });

  return cmd;
}
