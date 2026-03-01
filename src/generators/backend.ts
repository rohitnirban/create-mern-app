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

export async function generateBackend(options: CLIOptions, outputDir: string): Promise<void> {
  const templatesDir = getTemplatesDir();
  const srcDir = path.join(templatesDir, 'base-backend');
  const isBackendOnly = options.stack === 'backend-only';
  const destDir = isBackendOnly
    ? path.join(outputDir, options.projectName)
    : path.join(outputDir, options.projectName, 'backend');

  await copyTemplate(srcDir, destDir, {
    projectName: options.projectName,
    packageManager: options.backendPm,
  });

  await patchPackageJson(destDir, {
    name: `${options.projectName}-backend`,
    packageManager: `${options.backendPm}@${PM_VERSION[options.backendPm]}`,
  });

  const envExample = path.join(destDir, '.env.example');
  const envDest = path.join(destDir, '.env');
  if (await fs.pathExists(envExample)) {
    await fs.copyFile(envExample, envDest);
  }

  if (options.language === 'javascript') {
    const { runJsTransform } = await import('../utils/jsTransform.js');
    await runJsTransform(destDir);
  }
}
