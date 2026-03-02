export type Stack = "frontend-only" | "backend-only" | "fullstack";
export type Language = "typescript" | "javascript";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type Deployment = "vercel" | "custom";

export interface CLIOptions {
  projectName: string;
  stack: Stack;
  language: Language;
  frontendPm: PackageManager;
  backendPm: PackageManager;
  deployment: Deployment;
  shadcn: boolean;
  shadcnComponents: string[];
  s3Upload: boolean;
}
