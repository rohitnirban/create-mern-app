import path from 'node:path';
import fs from 'fs-extra';

export interface PackageJsonPatch {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Read package.json from dir, apply patch (shallow merge of top-level fields), write back.
 */
export async function patchPackageJson(
  dir: string,
  patch: PackageJsonPatch
): Promise<void> {
  const filePath = path.join(dir, 'package.json');
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content) as Record<string, unknown>;

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (key === 'scripts' && typeof value === 'object' && value !== null) {
      (data as Record<string, unknown>).scripts = {
        ...((data.scripts as Record<string, string>) ?? {}),
        ...(value as Record<string, string>),
      };
    } else {
      (data as Record<string, unknown>)[key] = value;
    }
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Read and return parsed package.json from dir.
 */
export async function readPackageJson(dir: string): Promise<Record<string, unknown>> {
  const filePath = path.join(dir, 'package.json');
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content) as Record<string, unknown>;
}
