import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const cliRoot = path.resolve(__dirname, '..');

function copyRecursive(src, dest, exclude = new Set(['node_modules', '.git', 'dist', '.next'])) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    const name = path.basename(src);
    if (exclude.has(name)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry), exclude);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const backendSrc = path.join(root, 'backend');
const frontendSrc = path.join(root, 'frontend');
const baseBackend = path.join(cliRoot, 'templates', 'base-backend');
const baseFrontend = path.join(cliRoot, 'templates', 'base-frontend');

if (!fs.existsSync(backendSrc)) {
  console.error('Backend not found at', backendSrc);
  process.exit(1);
}
if (!fs.existsSync(frontendSrc)) {
  console.error('Frontend not found at', frontendSrc);
  process.exit(1);
}

copyRecursive(backendSrc, baseBackend);
console.log('Copied backend -> templates/base-backend');
copyRecursive(frontendSrc, baseFrontend);
console.log('Copied frontend -> templates/base-frontend');
