import path from 'node:path';
import { program } from 'commander';
import {
  intro,
  outro,
  text,
  select,
  confirm,
  multiselect,
  isCancel,
  cancel,
} from '@clack/prompts';
import type { CLIOptions, PackageManager, Stack } from './types.js';
import { scaffold, runInstalls, printSuccess } from './scaffold.js';
import fs from 'fs-extra';

const SHADCN_COMPONENT_OPTIONS = [
  { value: 'button', label: 'Button' },
  { value: 'card', label: 'Card' },
  { value: 'input', label: 'Input' },
  { value: 'dialog', label: 'Dialog' },
  { value: 'dropdown-menu', label: 'Dropdown Menu' },
  { value: 'label', label: 'Label' },
  { value: 'select', label: 'Select' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'switch', label: 'Switch' },
];

function validateProjectName(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) return 'Project name is required.';
  if (/\s/.test(trimmed)) return 'Project name cannot contain spaces.';
  if (!/^[a-z0-9][a-z0-9-]*$/.test(trimmed)) {
    return 'Use only lowercase letters, numbers, and hyphens (valid npm name).';
  }
  return undefined;
}

export async function run(): Promise<void> {
  program
    .name('create-mern-app')
    .description('Scaffold production-ready MERN (MongoDB, Express, React, Node.js) projects')
    .argument('[project-name]', 'Project name (skips prompt if provided)')
    .parse(process.argv);

  const positionalName = program.args[0] as string | undefined;
  let projectName: string;

  intro('create-mern-app');

  if (positionalName !== undefined && positionalName.length > 0) {
    const err = validateProjectName(positionalName);
    if (err) {
      cancel(err);
      process.exit(1);
    }
    projectName = positionalName.trim().toLowerCase();
  } else {
    const nameResult = await text({
      message: 'Project name?',
      placeholder: 'my-mern-app',
      validate(value) {
        return validateProjectName(value);
      },
    });
    if (isCancel(nameResult)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    projectName = nameResult.trim().toLowerCase();
  }

  const stackResult = await select<Stack>({
    message: 'Stack?',
    options: [
      { value: 'frontend-only', label: 'Frontend only' },
      { value: 'backend-only', label: 'Backend only' },
      { value: 'fullstack', label: 'Fullstack' },
    ],
  });
  if (isCancel(stackResult)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  const stack = stackResult;

  const languageResult = await select<'typescript' | 'javascript'>({
    message: 'Language?',
    options: [
      { value: 'typescript', label: 'TypeScript (recommended)', hint: 'default' },
      { value: 'javascript', label: 'JavaScript' },
    ],
  });
  if (isCancel(languageResult)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  const language = languageResult;

  const pmOptions: { value: PackageManager; label: string }[] = [
    { value: 'npm', label: 'npm' },
    { value: 'pnpm', label: 'pnpm' },
    { value: 'yarn', label: 'yarn' },
    { value: 'bun', label: 'bun' },
  ];

  let frontendPm: PackageManager = 'pnpm';
  let backendPm: PackageManager = 'npm';

  if (stack === 'fullstack') {
    const fePm = await select<PackageManager>({
      message: 'Frontend package manager?',
      options: pmOptions,
    });
    if (isCancel(fePm)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    frontendPm = fePm;

    const bePm = await select<PackageManager>({
      message: 'Backend package manager?',
      options: pmOptions,
    });
    if (isCancel(bePm)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    backendPm = bePm;
  } else if (stack === 'frontend-only') {
    const fePm = await select<PackageManager>({
      message: 'Package manager?',
      options: pmOptions,
    });
    if (isCancel(fePm)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    frontendPm = fePm;
  } else {
    const bePm = await select<PackageManager>({
      message: 'Package manager?',
      options: pmOptions,
    });
    if (isCancel(bePm)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    backendPm = bePm;
  }

  const deploymentResult = await select<'vercel' | 'custom'>({
    message: 'Deployment?',
    options: [
      { value: 'vercel', label: 'Vercel (generates vercel.json)' },
      { value: 'custom', label: 'Custom (skip)' },
    ],
  });
  if (isCancel(deploymentResult)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  const deployment = deploymentResult;

  let s3Upload = false;
  if (stack === 'backend-only' || stack === 'fullstack') {
    const s3Result = await confirm({
      message: 'Add AWS S3 file upload? (Multer + S3, scalable uploads)',
      initialValue: false,
    });
    if (isCancel(s3Result)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    s3Upload = s3Result;
  }

  let shadcn = false;
  let shadcnComponents: string[] = [];

  if (stack === 'frontend-only' || stack === 'fullstack') {
    const shadcnResult = await confirm({
      message: 'Add Shadcn/ui?',
      initialValue: false,
    });
    if (isCancel(shadcnResult)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    shadcn = shadcnResult;

    if (shadcn) {
      const componentsResult = await multiselect({
        message: 'Which Shadcn components?',
        options: SHADCN_COMPONENT_OPTIONS,
        required: false,
      });
      if (isCancel(componentsResult)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }
      shadcnComponents = componentsResult as string[];
    }
  }

  const options: CLIOptions = {
    projectName,
    stack,
    language,
    frontendPm,
    backendPm,
    deployment,
    shadcn,
    shadcnComponents,
    s3Upload,
  };

  const outputDir = process.cwd();
  const projectDir = path.join(outputDir, options.projectName);

  if (await fs.pathExists(projectDir)) {
    const overwriteResult = await select<'yes' | 'no' | 'merge'>({
      message: `Directory "${options.projectName}" already exists. Overwrite?`,
      options: [
        { value: 'yes', label: 'Yes, remove and recreate' },
        { value: 'no', label: 'No, cancel' },
        { value: 'merge', label: 'Merge (keep existing, add/overwrite files)' },
      ],
    });
    if (isCancel(overwriteResult)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    if (overwriteResult === 'no') {
      cancel('Cancelled.');
      process.exit(0);
    }
    if (overwriteResult === 'yes') {
      await fs.remove(projectDir);
    }
  }

  await scaffold(options, outputDir);

  const installNow = await confirm({
    message: 'Install dependencies now?',
    initialValue: true,
  });
  if (isCancel(installNow)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  if (installNow) {
    await runInstalls(options, outputDir);
  }

  printSuccess(options, outputDir);
  outro('Done!');
}
