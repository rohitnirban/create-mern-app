import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve CLI package root (create-mern-app/). When run from dist/, this is parent of dist. */
export function getPackageRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

export function getTemplatesDir(): string {
  return path.join(getPackageRoot(), 'templates');
}
