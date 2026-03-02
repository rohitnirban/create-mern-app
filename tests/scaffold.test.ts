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
  s3Upload: false,
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

  it('creates backend with S3 upload when s3Upload is true', async () => {
    const options: CLIOptions = {
      ...fullstackOptions,
      projectName: 'e2e-s3',
      s3Upload: true,
    };
    await scaffold(options, tmpDir);

    const projectDir = path.join(tmpDir, 'e2e-s3');
    const backendDir = path.join(projectDir, 'backend');

    expect(await fs.pathExists(path.join(backendDir, 'src', 'config', 's3.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(backendDir, 'src', 'routes', 'upload.routes.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(backendDir, 'src', 'services', 'upload.service.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(backendDir, 'src', 'middleware', 'multerUpload.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(backendDir, 'src', 'controllers', 'upload.controller.ts'))).toBe(true);

    const backendPkg = JSON.parse(await fs.readFile(path.join(backendDir, 'package.json'), 'utf8'));
    expect(backendPkg.dependencies.multer).toBeDefined();
    expect(backendPkg.dependencies['@aws-sdk/client-s3']).toBeDefined();
    expect(backendPkg.devDependencies['@types/multer']).toBeDefined();

    const envExample = await fs.readFile(path.join(backendDir, '.env.example'), 'utf8');
    expect(envExample).toContain('AWS_REGION');
    expect(envExample).toContain('AWS_S3_BUCKET');

    const appContent = await fs.readFile(path.join(backendDir, 'src', 'app.ts'), 'utf8');
    expect(appContent).toContain('upload.routes');
    expect(appContent).toContain('/api/v1/upload');
  });
});
