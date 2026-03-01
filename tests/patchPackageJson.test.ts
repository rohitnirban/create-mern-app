import path from 'node:path';
import fs from 'fs-extra';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { patchPackageJson, readPackageJson } from '../src/utils/patchPackageJson.js';

const tmpDir = path.join(process.cwd(), 'tmp-test-patch');

describe('patchPackageJson', () => {
  beforeEach(async () => {
    await fs.ensureDir(tmpDir);
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify(
        {
          name: 'original',
          version: '1.0.0',
          scripts: { dev: 'tsx watch src/index.ts', build: 'tsc' },
        },
        null,
        2
      ),
      'utf8'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir).catch(() => {});
  });

  it('patches name and merges scripts', async () => {
    await patchPackageJson(tmpDir, {
      name: 'my-app-backend',
      scripts: { start: 'node dist/index.js' },
    });
    const pkg = await readPackageJson(tmpDir);
    expect(pkg.name).toBe('my-app-backend');
    expect((pkg.scripts as Record<string, string>).dev).toBe('tsx watch src/index.ts');
    expect((pkg.scripts as Record<string, string>).start).toBe('node dist/index.js');
  });

  it('preserves other fields when patching', async () => {
    await patchPackageJson(tmpDir, { name: 'patched' });
    const pkg = await readPackageJson(tmpDir);
    expect(pkg.version).toBe('1.0.0');
    expect((pkg.scripts as Record<string, string>).dev).toBeDefined();
  });
});
