import path from 'node:path';
import fs from 'fs-extra';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runJsTransform } from '../src/utils/jsTransform.js';

const tmpDir = path.join(process.cwd(), 'tmp-test-js-transform');

describe('runJsTransform', () => {
  beforeEach(async () => {
    await fs.ensureDir(tmpDir);
    await fs.ensureDir(path.join(tmpDir, 'src'));
    await fs.writeFile(
      path.join(tmpDir, 'src', 'index.ts'),
      'const x: number = 1;\nexport const add = (a: number, b: number): number => a + b;\n',
      'utf8'
    );
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify(
        {
          name: 'test',
          scripts: { dev: 'tsx watch src/index.ts', build: 'tsc' },
          devDependencies: { typescript: '^5.0.0', tsx: '^4.0.0', '@types/node': '^20.0.0' },
        },
        null,
        2
      ),
      'utf8'
    );
    await fs.writeFile(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { outDir: 'dist' } }),
      'utf8'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
  });

  it('strips types and renames .ts to .js', async () => {
    await runJsTransform(tmpDir);
    const jsPath = path.join(tmpDir, 'src', 'index.js');
    expect(await fs.pathExists(jsPath)).toBe(true);
    expect(await fs.pathExists(path.join(tmpDir, 'src', 'index.ts'))).toBe(false);
    const code = await fs.readFile(jsPath, 'utf8');
    expect(code).not.toMatch(/: number/);
    expect(code).toMatch(/const x = 1/);
    expect(code).toMatch(/export const add/);
  });

  it('removes tsconfig.json', async () => {
    await runJsTransform(tmpDir);
    expect(await fs.pathExists(path.join(tmpDir, 'tsconfig.json'))).toBe(false);
  });

  it('cleans package.json of typescript and @types deps and replaces scripts', async () => {
    await runJsTransform(tmpDir);
    const pkg = JSON.parse(await fs.readFile(path.join(tmpDir, 'package.json'), 'utf8'));
    expect(pkg.devDependencies?.typescript).toBeUndefined();
    expect(pkg.devDependencies?.tsx).toBeUndefined();
    expect(pkg.devDependencies?.['@types/node']).toBeUndefined();
    expect(pkg.scripts.dev).toMatch(/\bnode\b/);
    expect(pkg.scripts.dev).not.toMatch(/\btsx\b/);
  });
});
