import path from 'node:path';
import fs from 'fs-extra';
import type { CLIOptions, PackageManager } from '../types.js';
import { copyTemplate } from '../utils/copyTemplate.js';
import { patchPackageJson } from '../utils/patchPackageJson.js';
import { getTemplatesDir } from '../utils/paths.js';

const PM_VERSION: Record<PackageManager, string> = {
  npm: '9.0.0',
  pnpm: '9.0.0',
  yarn: '1.22.0',
  bun: '1.0.0',
};

export async function generateFrontend(options: CLIOptions, outputDir: string): Promise<void> {
  const templatesDir = getTemplatesDir();
  const srcDir = path.join(templatesDir, 'base-frontend');
  const isFrontendOnly = options.stack === 'frontend-only';
  const destDir = isFrontendOnly
    ? path.join(outputDir, options.projectName)
    : path.join(outputDir, options.projectName, 'frontend');

  await copyTemplate(srcDir, destDir, {
    projectName: options.projectName,
    packageManager: options.frontendPm,
  });

  await patchPackageJson(destDir, {
    name: `${options.projectName}-frontend`,
    packageManager: `${options.frontendPm}@${PM_VERSION[options.frontendPm]}`,
  });

  if (options.frontendPm !== 'pnpm') {
    const pnpmLock = path.join(destDir, 'pnpm-lock.yaml');
    if (await fs.pathExists(pnpmLock)) await fs.remove(pnpmLock);
    const pnpmWorkspace = path.join(destDir, 'pnpm-workspace.yaml');
    if (await fs.pathExists(pnpmWorkspace)) await fs.remove(pnpmWorkspace);
  }
  if (!isFrontendOnly) {
    const pnpmWorkspace = path.join(destDir, 'pnpm-workspace.yaml');
    if (await fs.pathExists(pnpmWorkspace)) await fs.remove(pnpmWorkspace);
  }

  if (options.language === 'javascript') {
    const { runJsTransform } = await import('../utils/jsTransform.js');
    await runJsTransform(destDir);
  }
}
