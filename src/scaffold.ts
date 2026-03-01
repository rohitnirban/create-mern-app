import path from 'node:path';
import fs from 'fs-extra';
import type { CLIOptions, PackageManager } from './types.js';
import { generateBackend } from './generators/backend.js';
import { generateFrontend } from './generators/frontend.js';
import { generateVercel } from './generators/vercel.js';
import { generateShadcn } from './generators/shadcn.js';
import { installDeps } from './utils/installDeps.js';
import { log } from './utils/logger.js';

function prefixCmd(pm: PackageManager, script: string, dir: string): string {
  if (pm === 'yarn') return `yarn --cwd ${dir} ${script}`;
  return `${pm} run ${script} --prefix ${dir}`;
}

async function createRootPackageJson(options: CLIOptions, projectDir: string): Promise<void> {
  const backendDir = 'backend';
  const frontendDir = 'frontend';
  const devBackend = prefixCmd(options.backendPm, 'dev', backendDir);
  const devFrontend = prefixCmd(options.frontendPm, 'dev', frontendDir);
  const buildBackend = prefixCmd(options.backendPm, 'build', backendDir);
  const buildFrontend = prefixCmd(options.frontendPm, 'build', frontendDir);

  const pkg = {
    name: options.projectName,
    private: true,
    scripts: {
      dev: `concurrently "${devBackend}" "${devFrontend}"`,
      'dev:backend': devBackend,
      'dev:frontend': devFrontend,
      build: `${buildBackend} && ${buildFrontend}`,
    },
    devDependencies: {
      concurrently: '^8.0.0',
    },
  };
  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
    'utf8'
  );
}

/**
 * Scaffold the project. On failure, removes the partial output directory.
 * outputDir is typically process.cwd().
 */
export async function scaffold(options: CLIOptions, outputDir: string): Promise<void> {
  const projectDir = path.join(outputDir, options.projectName);

  try {
    await fs.ensureDir(projectDir);

    if (options.stack === 'backend-only' || options.stack === 'fullstack') {
      await generateBackend(options, outputDir);
    }
    if (options.stack === 'frontend-only' || options.stack === 'fullstack') {
      await generateFrontend(options, outputDir);
    }
    if (options.deployment === 'vercel' && (options.stack === 'backend-only' || options.stack === 'fullstack')) {
      await generateVercel(options, outputDir);
    }
    if (options.shadcn && (options.stack === 'frontend-only' || options.stack === 'fullstack')) {
      await generateShadcn(options, outputDir);
    }
    if (options.stack === 'fullstack') {
      await createRootPackageJson(options, projectDir);
    }
  } catch (err) {
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir).catch(() => {});
    }
    throw err;
  }
}

/**
 * Run package manager install in each part of the project (and root if fullstack).
 * Logs progress before each install so output streams to terminal via stdio: 'inherit'.
 */
export async function runInstalls(options: CLIOptions, outputDir: string): Promise<void> {
  const projectDir = path.join(outputDir, options.projectName);

  if (options.stack === 'fullstack') {
    log.step('Installing root dependencies (npm)...');
    await installDeps(projectDir, 'npm');
    log.step('Installing backend dependencies...');
    await installDeps(path.join(projectDir, 'backend'), options.backendPm);
    log.step('Installing frontend dependencies...');
    await installDeps(path.join(projectDir, 'frontend'), options.frontendPm);
  } else if (options.stack === 'backend-only') {
    log.step('Installing backend dependencies...');
    await installDeps(projectDir, options.backendPm);
  } else {
    log.step('Installing frontend dependencies...');
    await installDeps(projectDir, options.frontendPm);
  }
}

function runDevCmd(pm: PackageManager, dir: string): string {
  if (pm === 'pnpm') return `cd ${dir} && pnpm dev`;
  if (pm === 'yarn') return `cd ${dir} && yarn dev`;
  if (pm === 'bun') return `cd ${dir} && bun run dev`;
  return `cd ${dir} && npm run dev`;
}

/**
 * Print success message with next steps.
 */
export function printSuccess(options: CLIOptions, _outputDir: string): void {
  const { projectName, stack } = options;

  log.success(`Project "${projectName}" created successfully!`);
  console.log('');
  console.log('Next steps:');
  console.log(`  cd ${projectName}`);
  console.log('');

  if (stack === 'fullstack') {
    console.log('  # Start backend');
    console.log(`  ${runDevCmd(options.backendPm, 'backend')}`);
    console.log('');
    console.log('  # Start frontend (new terminal)');
    console.log(`  ${runDevCmd(options.frontendPm, 'frontend')}`);
  } else if (stack === 'backend-only') {
    console.log(`  ${runDevCmd(options.backendPm, '.')}`);
  } else {
    console.log(`  ${runDevCmd(options.frontendPm, '.')}`);
  }

  if (stack === 'backend-only' || stack === 'fullstack') {
    console.log('');
    console.log('  # Configure environment');
    console.log('  cp backend/.env.example backend/.env');
    console.log('  # Edit backend/.env with your MongoDB URI');
  }

  if (options.shadcn && options.shadcnComponents.length > 0) {
    console.log('');
    console.log('  # Install shadcn components');
    console.log('  cd frontend');
    console.log(`  npx shadcn@latest add ${options.shadcnComponents.join(' ')}`);
  }
  console.log('');
}
