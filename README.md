# @rohitnirban/create-mern-app

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Scaffold production-ready **MERN** (MongoDB, Express, React, Node.js) projects with an interactive CLI. Open source and welcoming contributions.

## Features

### CLI options

- **Stack options**: Fullstack, frontend-only, or backend-only
- **Language**: TypeScript (recommended) or JavaScript
- **Package managers**: npm, pnpm, yarn, or bun
- **Deployment**: Optional Vercel config (`vercel.json`)
- **AWS S3 file upload**: Multer + S3 for scalable file uploads (backend/fullstack only)
- **UI**: Optional [shadcn/ui](https://ui.shadcn.com/) components (Button, Card, Input, Dialog, etc.)

### What’s included in generated apps

#### Security & auth

- **CSRF protection** — `X-CSRF-Token` header validated against cookie on mutations (POST/PUT/PATCH/DELETE); axios interceptor auto-attaches token
- **JWT auth** — access + refresh tokens in HTTP-only cookies; automatic token refresh on 401 with request queue
- **Rate limiting** — login (10/15min), register (5/15min), refresh throttled; express-rate-limit
- **Request validation** — Zod schemas on register, login, create post; validated before handlers
- **Role-based access** — `authenticate` + `authorize` middleware; roles: `user`, `manager`, `admin`
- **Helmet** — secure HTTP headers
- **CORS** — configurable origin, credentials supported

#### API & routes

- **Auth routes** — `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me`
- **Post routes** — `GET /posts` (paginated), `GET /posts/admin` (admin-only, paginated), `GET /posts/:id`, `POST /posts` (manager/admin), `POST /posts/seed` (admin, sample data)
- **Health routes** — `GET /health` (liveness), `GET /health/ready` (readiness + MongoDB check)
- **Upload route** (optional, when S3 enabled) — `POST /api/v1/upload` with Multer; authenticated + CSRF-protected
- **Consistent API shape** — `ApiSuccessResponse<T>`, `ApiErrorResponse`; `successResponse()` / `errorResponse()` helpers

#### AWS S3 file upload (optional)

- **Multer** — memory storage, `.single('file')`, 10 MB limit
- **AWS S3** — `@aws-sdk/client-s3`; uploads to `uploads/{userId}/{uuid}{ext}`
- **Allowed types** — images (jpeg, png, gif, webp), PDF
- **Scalable** — no local disk; streams buffer to S3; works with any deployment (Vercel, etc.)
- **Env vars** — `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`

#### Pagination & types (backend)

- **Paginated types** — `PaginatedData<T>`, `PaginationMeta` (page, limit, totalItems, totalPages, hasNextPage, hasPrevPage)
- **Query helpers** — `getPaginationParams()` for `?page=&limit=` with defaults and `maxLimit`
- **Reusable** — works for any resource (posts, users, etc.)

#### Frontend

- **Route protection** — Next.js middleware guards `/dashboard`, `/posts`; redirects unauthenticated users to `/login`
- **Auth-aware routing** — redirects logged-in users away from `/login`, `/register`
- **React Query (TanStack Query)** — `useQuery`, `useMutation`, `useQueryClient`; centralized `queryKeys`
- **Paginated data table** — TanStack Table + `usePaginatedQuery`; server-side pagination, page size selector (10/20/50/100), manual pagination
- **Generic `usePaginatedQuery`** — fetcher returns `{ items, pagination }`; caches by `(queryKeyPrefix + params)` per page
- **Typed API** — `ApiSuccessResponse`, `Post`, `User`, `PaginationMeta`, `PaginatedPostsResponse`; shared types across app

## Requirements

- **Node.js** >= 18
- **npm** / **pnpm** / **yarn** / **bun** (for installing dependencies in the generated project)

## Quick start

```bash
# Using npx (no install)
npx @rohitnirban/create-mern-app my-app

# Or with npm create
npm create @rohitnirban/create-mern-app@latest my-app
```

You can omit the project name to be prompted. The CLI will ask for:

- Project name (if not provided)
- Stack (fullstack / frontend-only / backend-only)
- Language (TypeScript / JavaScript)
- Package manager(s)
- Deployment (Vercel / custom)
- AWS S3 file upload (yes/no, backend/fullstack only)
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

- **Fullstack**: Monorepo with `backend/` (Express + MongoDB) and `frontend/` (Next.js + React). Root `package.json` has `dev`, `dev:backend`, `dev:frontend`, and `build` scripts.
- **Frontend-only**: Single `frontend/` (Next.js + React).
- **Backend-only**: Single `backend/` (Express + MongoDB).

When S3 upload is enabled, backend gets `src/config/s3.ts`, `src/routes/upload.routes.ts`, `src/services/upload.service.ts`, `src/middleware/multerUpload.ts`, and `POST /api/v1/upload` (auth + CSRF required). Add `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET` to `.env`.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. By participating, you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT - see [LICENSE](LICENSE) for details.
