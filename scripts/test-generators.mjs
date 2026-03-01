import path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function importPath(...parts) {
  return pathToFileURL(path.join(root, ...parts)).href;
}

async function run() {
  const out = path.join(root, 'tmp-phase3-test');
  await fs.remove(out).catch(() => {});
  await fs.ensureDir(out);

  const options = {
    projectName: 'test-app',
    stack: 'fullstack',
    language: 'typescript',
    frontendPm: 'pnpm',
    backendPm: 'npm',
    deployment: 'vercel',
    shadcn: true,
    shadcnComponents: ['button', 'card'],
  };

  const { generateBackend } = await import(importPath('dist', 'generators', 'backend.js'));
  const { generateFrontend } = await import(importPath('dist', 'generators', 'frontend.js'));
  const { generateVercel } = await import(importPath('dist', 'generators', 'vercel.js'));
  const { generateShadcn } = await import(importPath('dist', 'generators', 'shadcn.js'));

  await generateBackend(options, out);
  console.log('✓ generateBackend: backend/ exists');
  const bePkg = await fs.readJson(path.join(out, 'test-app', 'backend', 'package.json'));
  if (bePkg.name !== 'test-app-backend') throw new Error('backend name not patched');
  console.log('✓ backend package.json name:', bePkg.name);

  await generateFrontend(options, out);
  console.log('✓ generateFrontend: frontend/ exists');
  const fePkg = await fs.readJson(path.join(out, 'test-app', 'frontend', 'package.json'));
  if (fePkg.name !== 'test-app-frontend') throw new Error('frontend name not patched');
  console.log('✓ frontend package.json name:', fePkg.name);

  await generateVercel(options, out);
  const vercelPath = path.join(out, 'test-app', 'backend', 'vercel.json');
  if (!(await fs.pathExists(vercelPath))) throw new Error('vercel.json not created');
  const vercel = await fs.readJson(vercelPath);
  if (vercel.builds[0].src !== 'src/server.ts') throw new Error('vercel entry should be server.ts');
  console.log('✓ generateVercel: vercel.json with server.ts entry');

  await generateShadcn(options, out);
  const componentsPath = path.join(out, 'test-app', 'frontend', 'components.json');
  if (!(await fs.pathExists(componentsPath))) throw new Error('components.json not created');
  const comp = await fs.readJson(componentsPath);
  if (comp.tsx !== true) throw new Error('tsx should be true for typescript');
  console.log('✓ generateShadcn: components.json with tsx true');

  await fs.remove(out);
  console.log('\nAll Phase 3 generators passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
