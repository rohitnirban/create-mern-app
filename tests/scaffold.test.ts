import path from 'node:path';
import fs from 'fs-extra';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scaffold } from '../src/scaffold.js';
import type { CLIOptions } from '../src/types.js';

const tmpDir = path.join(process.cwd(), 'tmp-e2e-scaffold');

const fullstackOptions: CLIOptions = {
  projectName: 'e2e-fullstack',
  stack: 'fullstack',
  language: 'typescript',
  frontendPm: 'pnpm',
  backendPm: 'npm',
  deployment: 'vercel',
  shadcn: true,
  shadcnComponents: ['button', 'card'],
};

describe('scaffold (e2e)', () => {
  beforeEach(async () => {
    await fs.ensureDir(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
  });

  it('creates fullstack project with backend, frontend, root package.json, vercel.json, components.json', async () => {
    await scaffold(fullstackOptions, tmpDir);

    const projectDir = path.join(tmpDir, 'e2e-fullstack');
    expect(await fs.pathExists(projectDir)).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'backend', 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'frontend', 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'backend', 'vercel.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'frontend', 'components.json'))).toBe(true);

    const rootPkg = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf8'));
    expect(rootPkg.name).toBe('e2e-fullstack');
    expect(rootPkg.scripts.dev).toMatch(/concurrently/);
    expect(rootPkg.scripts['dev:backend']).toMatch(/backend/);
    expect(rootPkg.scripts['dev:frontend']).toMatch(/frontend/);

    const backendPkg = JSON.parse(await fs.readFile(path.join(projectDir, 'backend', 'package.json'), 'utf8'));
    expect(backendPkg.name).toBe('e2e-fullstack-backend');

    const frontendPkg = JSON.parse(await fs.readFile(path.join(projectDir, 'frontend', 'package.json'), 'utf8'));
    expect(frontendPkg.name).toBe('e2e-fullstack-frontend');
  });
});
