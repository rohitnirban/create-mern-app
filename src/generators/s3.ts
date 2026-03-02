import path from 'node:path';
import fs from 'fs-extra';
import type { CLIOptions } from '../types.js';
import { getTemplatesDir } from '../utils/paths.js';
import { copyTemplate } from '../utils/copyTemplate.js';
import { readPackageJson } from '../utils/patchPackageJson.js';

export async function generateS3(options: CLIOptions, outputDir: string): Promise<void> {
  if (!options.s3Upload) return;

  const templatesDir = getTemplatesDir();
  const isBackendOnly = options.stack === 'backend-only';
  const backendDir = isBackendOnly
    ? path.join(outputDir, options.projectName)
    : path.join(outputDir, options.projectName, 'backend');

  const extrasS3Dir = path.join(templatesDir, 'extras', 's3');
  const backendSrcDir = path.join(backendDir, 'src');

  await copyTemplate(extrasS3Dir, backendSrcDir, {
    projectName: options.projectName,
    packageManager: options.backendPm,
  });

  const pkg = (await readPackageJson(backendDir)) as Record<string, unknown> & {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  pkg.dependencies = {
    ...pkg.dependencies,
    multer: '^1.4.5-lts.1',
    '@aws-sdk/client-s3': '^3.700.0',
  };
  pkg.devDependencies = {
    ...pkg.devDependencies,
    '@types/multer': '^1.4.12',
  };
  await fs.writeFile(
    path.join(backendDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
    'utf8'
  );

  const envExamplePath = path.join(backendDir, '.env.example');
  const envExample = await fs.readFile(envExamplePath, 'utf8').catch(() => '');
  const s3EnvVars = `
# AWS S3 (file upload)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
`;
  if (!envExample.includes('AWS_S3_BUCKET')) {
    await fs.writeFile(envExamplePath, envExample.trimEnd() + s3EnvVars + '\n', 'utf8');
  }

  const appPath = path.join(backendDir, 'src', 'app.ts');
  let appContent = await fs.readFile(appPath, 'utf8');

  if (!appContent.includes('upload.routes')) {
    appContent = appContent.replace(
      /import \{ healthRouter \} from "\.\/routes\/health\.routes";/,
      'import { healthRouter } from "./routes/health.routes";\nimport uploadRoutes from "./routes/upload.routes";'
    );
    appContent = appContent.replace(
      /app\.use\("\/api\/v1\/health", healthRouter\);/,
      'app.use("/api/v1/health", healthRouter);\napp.use("/api/v1/upload", uploadRoutes);'
    );
    await fs.writeFile(appPath, appContent, 'utf8');
  }

  if (options.language === 'javascript') {
    const { runJsTransform } = await import('../utils/jsTransform.js');
    await runJsTransform(backendDir);
  }
}
