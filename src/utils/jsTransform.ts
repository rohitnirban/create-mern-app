import path from 'node:path';
import fs from 'fs-extra';
import { transformSync } from '@babel/core';
import { glob } from 'glob';
import { readPackageJson, patchPackageJson } from './patchPackageJson.js';

const TS_PRESET = ['@babel/preset-typescript', { isTSX: false }];
const TSX_PRESETS = [
  ['@babel/preset-typescript', { isTSX: true }],
  ['@babel/preset-react', {}],
];

function stripTypes(code: string, filename: string): string {
  const isTsx = filename.endsWith('.tsx');
  const result = transformSync(code, {
    presets: isTsx ? TSX_PRESETS : [TS_PRESET],
    filename,
    configFile: false,
    babelrc: false,
  });
  if (!result?.code) throw new Error(`Babel failed for ${filename}`);
  return result.code;
}

function removeImportExtensions(code: string): string {
  return code
    .replace(/from\s+['"](\.\/[^'"]+)\.ts['"]/g, "from '$1'")
    .replace(/from\s+['"](\.\/[^'"]+)\.tsx['"]/g, "from '$1'")
    .replace(/(import\s+[^'"]*['"])(\.\/[^'"]+)\.ts(['"])/g, '$1$2$3')
    .replace(/(import\s+[^'"]*['"])(\.\/[^'"]+)\.tsx(['"])/g, '$1$2$3');
}

async function cleanupPackageJson(dir: string): Promise<void> {
  const pkg = (await readPackageJson(dir)) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  };
  const strip = (deps: Record<string, string> | undefined): Record<string, string> => {
    if (!deps) return {};
    return Object.fromEntries(
      Object.entries(deps).filter(
        ([name]) =>
          name !== 'typescript' &&
          name !== 'ts-node' &&
          name !== 'tsx' &&
          !name.startsWith('@types/')
      )
    );
  };
  const newDeps = strip(pkg.dependencies);
  const newDevDeps = strip(pkg.devDependencies);
  const scriptRepl = (scripts: Record<string, string> | undefined): Record<string, string> => {
    if (!scripts) return {};
    return Object.fromEntries(
      Object.entries(scripts).map(([k, v]) => [
        k,
        v
          .replace(/\bts-node\b/g, 'node')
          .replace(/\btsx\b/g, 'node')
          .replace(/\btsx\s+/g, 'node '),
      ])
    )
  };
  await patchPackageJson(dir, {
    dependencies: newDeps,
    devDependencies: newDevDeps,
    scripts: scriptRepl(pkg.scripts),
  } as Record<string, unknown>);
}

/**
 * Transform a directory from TypeScript to JavaScript: strip types, rename files, clean package.json.
 */
export async function runJsTransform(dir: string): Promise<void> {
  const tsFiles = await glob('**/*.ts', { cwd: dir, dot: false, nodir: true });
  const tsxFiles = await glob('**/*.tsx', { cwd: dir, dot: false, nodir: true });
  const skip = (f: string) => f.endsWith('.d.ts');
  const allTs = [...tsFiles.filter((f) => !skip(f)), ...tsxFiles];

  for (const rel of allTs) {
    const ext = path.extname(rel);
    const newExt = ext === '.tsx' ? '.jsx' : '.js';
    const srcPath = path.join(dir, rel);
    const outPath = path.join(dir, rel.slice(0, -ext.length) + newExt);
    const code = await fs.readFile(srcPath, 'utf8');
    const transformed = stripTypes(removeImportExtensions(code), rel);
    await fs.writeFile(outPath, transformed, 'utf8');
    await fs.remove(srcPath);
  }

  const viteTs = path.join(dir, 'vite.config.ts');
  if (await fs.pathExists(viteTs)) {
    const code = await fs.readFile(viteTs, 'utf8');
    const transformed = stripTypes(code, 'vite.config.ts');
    await fs.writeFile(path.join(dir, 'vite.config.js'), transformed, 'utf8');
    await fs.remove(viteTs);
  }

  const tsconfigPath = path.join(dir, 'tsconfig.json');
  if (await fs.pathExists(tsconfigPath)) await fs.remove(tsconfigPath);

  await cleanupPackageJson(dir);
}
