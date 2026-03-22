# create-mfe

A CLI tool for scaffolding microfrontend projects using Vite + React with Module Federation.

## Deployed Examples

### Documentation
- **Docs Site:** https://funny-brigadeiros-6807ac.netlify.app

### Example Project
- **Shell (Main App):** https://cheerful-melba-d5f67c.netlify.app
- **Dashboard (Remote):** https://unique-blini-3b08f3.netlify.app
- **Profile (Remote):** https://dapper-fenglisu-032859.netlify.app

## Features

- Vite + React + TypeScript
- Module Federation via @originjs/vite-plugin-federation
- Shared packages: UI (Tailwind/shadcn), Utils, Store (Zustand), Auth
- React Query integration
- Express API server
- Netlify deployment ready

## Quick Start

```bash
npx create-mfe init my-mfe-app
```

## Development

```bash
# Install dependencies
pnpm install

# Start API (if included)
pnpm run dev:api

# Terminal 1: Build remotes
pnpm run dev:remotes

# Terminal 2: Serve remotes
pnpm run serve:remotes

# Terminal 3: Dev shell
pnpm run dev:shell
```

## Deployment

See [Deployment Guide](./docs/deployment.md)