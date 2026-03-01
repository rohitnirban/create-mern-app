# create-mern-app

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Scaffold production-ready **MERN** (MongoDB, Express, React, Node.js) projects with an interactive CLI. Open source and welcoming contributions.

## Features

- **Stack options**: Fullstack, frontend-only, or backend-only
- **Language**: TypeScript (recommended) or JavaScript
- **Package managers**: npm, pnpm, yarn, or bun
- **Deployment**: Optional Vercel config (`vercel.json`)
- **UI**: Optional [shadcn/ui](https://ui.shadcn.com/) components (Button, Card, Input, Dialog, etc.)

## Requirements

- **Node.js** >= 18
- **npm** / **pnpm** / **yarn** / **bun** (for installing dependencies in the generated project)

## Quick start

```bash
# Using npx (no install)
npx create-mern-app my-app

# Or with npm create
npm create mern-app@latest my-app
```

You can omit the project name to be prompted. The CLI will ask for:

- Project name (if not provided)
- Stack (fullstack / frontend-only / backend-only)
- Language (TypeScript / JavaScript)
- Package manager(s)
- Deployment (Vercel / custom)
- Shadcn/ui (yes/no and component selection for frontend)

## Development

```bash
# Clone the repo (replace rohitnirban with your GitHub username)
git clone https://github.com/rohitnirban/create-mern-app.git
cd create-mern-app

# Install dependencies
npm install

# Build
npm run build

# Run the CLI locally (e.g. scaffold into a test folder)
node dist/index.js my-test-app

# Tests
npm test
```

## Project structure (generated app)

- **Fullstack**: Monorepo with `backend/` (Express + MongoDB) and `frontend/` (Vite + React). Root `package.json` has `dev`, `dev:backend`, `dev:frontend`, and `build` scripts.
- **Frontend-only**: Single `frontend/` (Vite + React).
- **Backend-only**: Single `backend/` (Express + MongoDB).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. By participating, you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT - see [LICENSE](LICENSE) for details.
