import path from 'node:path';
import fs from 'fs-extra';

const TOKEN_PROJECT_NAME = '__PROJECT_NAME__';
const TOKEN_PACKAGE_MANAGER = '__PACKAGE_MANAGER__';

export interface CopyTemplateTokens {
  projectName: string;
  packageManager: string;
}

const DEFAULT_EXCLUDE = new Set(['node_modules', '.git', 'dist', '.next']);

function replaceTokens(content: string, tokens: CopyTemplateTokens): string {
  return content
    .replaceAll(TOKEN_PROJECT_NAME, tokens.projectName)
    .replaceAll(TOKEN_PACKAGE_MANAGER, tokens.packageManager);
}

async function copyRecursive(
  srcDir: string,
  destDir: string,
  tokens: CopyTemplateTokens,
  exclude: Set<string> = DEFAULT_EXCLUDE
): Promise<void> {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  await fs.ensureDir(destDir);

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (exclude.has(entry.name)) continue;

    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath, tokens, exclude);
    } else {
      await fs.ensureDir(path.dirname(destPath));
      const content = await fs.readFile(srcPath, 'utf8').catch(() => null);
      if (content !== null && isTextFile(entry.name)) {
        const replaced = replaceTokens(content, tokens);
        await fs.writeFile(destPath, replaced, 'utf8');
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

function isTextFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const textExtensions = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.mjs', '.cjs',
    '.env', '.example', '.yaml', '.yml', '.txt', '.mts', '.cts',
  ]);
  if (textExtensions.has(ext)) return true;
  if (filename.startsWith('.env')) return true;
  return false;
}

/**
 * Recursively copy a template directory to the destination, replacing
 * __PROJECT_NAME__ and __PACKAGE_MANAGER__ in text files.
 */
export async function copyTemplate(
  srcDir: string,
  destDir: string,
  tokens: CopyTemplateTokens
): Promise<void> {
  await fs.ensureDir(path.dirname(destDir));
  await copyRecursive(srcDir, destDir, tokens);
}
