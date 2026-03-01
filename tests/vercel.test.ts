import path from 'node:path';
import fs from 'fs-extra';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateVercel } from '../src/generators/vercel.js';

const tmpDir = path.join(process.cwd(), 'tmp-test-vercel');

const baseOptions = {
  projectName: 'test-app',
  stack: 'fullstack' as const,
  language: 'typescript' as const,
  frontendPm: 'pnpm' as const,
  backendPm: 'npm' as const,
  deployment: 'vercel' as const,
  shadcn: false,
  shadcnComponents: [] as string[],
};

describe('generateVercel', () => {
  beforeEach(async () => {
    await fs.ensureDir(tmpDir);
    const backendDir = path.join(tmpDir, 'test-app', 'backend');
    await fs.ensureDir(backendDir);
    await fs.writeFile(
      path.join(backendDir, 'package.json'),
      JSON.stringify({ name: 'test-app-backend', main: 'dist/server.js' }, null, 2),
      'utf8'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
  });

  it('writes vercel.json with correct entry from package.json main', async () => {
    await generateVercel(baseOptions, tmpDir);
    const vercelPath = path.join(tmpDir, 'test-app', 'backend', 'vercel.json');
    expect(await fs.pathExists(vercelPath)).toBe(true);
    const vercel = JSON.parse(await fs.readFile(vercelPath, 'utf8'));
    expect(vercel.version).toBe(2);
    expect(vercel.builds[0].src).toBe('src/server.ts');
    expect(vercel.builds[0].use).toBe('@vercel/node');
    expect(vercel.routes[0].dest).toBe('src/server.ts');
  });

  it('adds vercel-build script to package.json', async () => {
    await generateVercel(baseOptions, tmpDir);
    const pkgPath = path.join(tmpDir, 'test-app', 'backend', 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    expect(pkg.scripts['vercel-build']).toBe('tsc');
  });

  it('uses .js entry when language is javascript', async () => {
    await generateVercel(
      { ...baseOptions, language: 'javascript' },
      tmpDir
    );
    const vercelPath = path.join(tmpDir, 'test-app', 'backend', 'vercel.json');
    const vercel = JSON.parse(await fs.readFile(vercelPath, 'utf8'));
    expect(vercel.builds[0].src).toBe('src/server.js');
  });
});
