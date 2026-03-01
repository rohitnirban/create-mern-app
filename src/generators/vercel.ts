import path from 'node:path';
import fs from 'fs-extra';
import type { CLIOptions } from '../types.js';
import { getTemplatesDir } from '../utils/paths.js';
import { readPackageJson } from '../utils/patchPackageJson.js';
import { patchPackageJson } from '../utils/patchPackageJson.js';

export async function generateVercel(options: CLIOptions, outputDir: string): Promise<void> {
  const isBackendOnly = options.stack === 'backend-only';
  const backendDir = isBackendOnly
    ? path.join(outputDir, options.projectName)
    : path.join(outputDir, options.projectName, 'backend');

  const ext = options.language === 'javascript' ? 'js' : 'ts';
  const main = (await readPackageJson(backendDir).catch(() => ({}))) as { main?: string };
  const mainSrc = main.main?.replace(/^dist\//, '').replace(/\.js$/, '') ?? 'server';
  const entryFile = mainSrc.includes('/') ? mainSrc : `src/${mainSrc}.${ext}`;

  const vercelJson = {
    version: 2,
    builds: [{ src: entryFile, use: '@vercel/node' }],
    routes: [{ src: '/(.*)', dest: entryFile }],
  };

  await fs.writeFile(
    path.join(backendDir, 'vercel.json'),
    JSON.stringify(vercelJson, null, 2) + '\n',
    'utf8'
  );

  await patchPackageJson(backendDir, {
    scripts: { 'vercel-build': 'tsc' },
  });
}
