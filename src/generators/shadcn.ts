import path from 'node:path';
import fs from 'fs-extra';
import type { CLIOptions } from '../types.js';
import { getTemplatesDir } from '../utils/paths.js';

export async function generateShadcn(options: CLIOptions, outputDir: string): Promise<void> {
  const isFrontendOnly = options.stack === 'frontend-only';
  const frontendDir = isFrontendOnly
    ? path.join(outputDir, options.projectName)
    : path.join(outputDir, options.projectName, 'frontend');

  const srcPath = path.join(getTemplatesDir(), 'extras', 'shadcn', 'components.json');
  const destPath = path.join(frontendDir, 'components.json');
  await fs.copyFile(srcPath, destPath);

  const raw = await fs.readFile(destPath, 'utf8');
  const data = JSON.parse(raw) as Record<string, unknown> & { tsx?: boolean; tailwind?: { css?: string }; aliases?: Record<string, string> };
  data.tsx = options.language === 'typescript';

  const tailwindCss = data.tailwind && typeof data.tailwind === 'object' && 'css' in data.tailwind
    ? (data.tailwind as { css: string }).css
    : 'src/index.css';
  if (data.tailwind && typeof data.tailwind === 'object') {
    (data.tailwind as Record<string, string>).css = tailwindCss;
  }
  data.aliases = {
    components: '@/components',
    utils: '@/lib/utils',
    ui: '@/components/ui',
    lib: '@/lib',
    hooks: '@/hooks',
  };

  await fs.writeFile(destPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
