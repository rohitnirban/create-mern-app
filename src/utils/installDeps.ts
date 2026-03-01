import path from 'node:path';
import { execa } from 'execa';
import type { PackageManager } from '../types.js';

const INSTALL_CMD: Record<PackageManager, string> = {
  npm: 'npm install',
  pnpm: 'pnpm install',
  yarn: 'yarn',
  bun: 'bun install',
};

/**
 * Run package manager install in dir. Uses stdio: 'inherit' so output streams to terminal.
 */
export async function installDeps(dir: string, pm: PackageManager): Promise<void> {
  const [cmd, ...args] = INSTALL_CMD[pm].split(/\s+/);
  await execa(cmd!, args, {
    cwd: path.resolve(dir),
    stdio: 'inherit',
  });
}
