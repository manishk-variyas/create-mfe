# Getting Started

Learn how to use `create-mfe` to scaffold your next microfrontend project.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: (Recommended) but also supports npm and yarn

## Quick Start

The fastest way to get started is to use the CLI directly:

```bash
npx create-mfe init my-mfe-app
```

## Initial Setup Questions

The CLI will ask you several questions to customize your project:

1. **Project Name**: The directory name for your new monorepo.
2. **Package Manager**: Choose between pnpm, npm, or yarn.
3. **Initial Modules**: A comma-separated list of feature modules (e.g. `dashboard,profile,settings`).
4. **Shared UI**: Whether to include a shared Tailwind UI package with Shadcn components.
5. **Shared Utils**: Include a library for shared hooks, helpers, and constants.
6. **Shared State**: Setup a global state using Zustand.
7. **Auth & Routing**: Add a dedicated auth module with protected routes and context provider.
8. **React Query**: Enable React Query for standardized data fetching and caching across the shell and modules.
9. **Include API**: Add a backend Express API server for serving data to your microfrontends.

## Next Steps

Once the scaffolding is complete, follow these steps to start developing:

```bash
# 1. Navigate to the project directory
cd my-mfe-app

# 2. Install dependencies (using your selected PM)
pnpm install
```

> **Why 3 terminals?**  
> `create-mfe` uses `@originjs/vite-plugin-federation`. This plugin does not emit `remoteEntry.js` files during Vite's standard HMR dev server loop. Therefore, **remote modules must be built** and served via `vite preview` so the shell can load them.

Start the workspace using separate terminals:

```bash
# Terminal 1 — Start the API server (if included)
pnpm run dev:api

# Terminal 2 — watch-build all remote modules
pnpm run dev:remotes

# Terminal 3 — serve the built remotes (run AFTER Terminal 2 finishes building)
pnpm run serve:remotes

# Terminal 4 — start the shell app with full HMR
pnpm run dev:shell
```

Now open `http://localhost:3000` to see your MFE shell in action!

Alternatively, to build and preview the entire workspace without HMR (good for testing integration before deployment):

```bash
pnpm run serve
```

## Environment Variables

If you included the API, a `.env` file is created with:

```
VITE_API_URL=http://localhost:3005/api
```

For production, update this to point to your deployed API URL.

## Going to Production

Once your workspace is ready, check out our [Deployment Guide](./deployment.md). It covers everything from injecting production URLs via `.env` files, setting up S3/Vercel/Netlify static hosts, and handling CORS for the independent remote builds.
