# full-monorepo

Microfrontend monorepo scaffolded with [create-mfe](https://github.com/your-org/create-mfe).

## Architecture

This workspace uses **Vite Module Federation** (`@originjs/vite-plugin-federation`) so each
module is developed, built, and deployed independently while sharing a single React instance.

```
full-monorepo/
├── apps/
│   ├── shell/          Host application (port 3000)
│   └── dashboard/         Feature module (port 3001)
│   └── profile/         Feature module (port 3002)
├── packages/
│   ├── ui/             Shared shadcn/ui components
│   ├── utils/          Shared hooks & helpers
│   ├── store/          Zustand global state
│   └── auth/           Auth context & route guards
└── mfe.config.json     CLI workspace manifest
```

## Getting started

```bash
pnpm install
```

> **Why 3 terminals?**
> [`@originjs/vite-plugin-federation`](https://github.com/originjs/vite-plugin-federation) does not
> support Vite's HMR dev server for **remote** apps — `remoteEntry.js` is only emitted after a build.
> Remotes must be built and served via `vite preview`.

```bash
# Terminal 1 — watch-build all remote modules on every file change
pnpm dev:remotes

# Terminal 2 — serve the built remotes (run AFTER Terminal 1 has finished its first build)
pnpm serve:remotes

# Terminal 3 — shell app with full HMR
pnpm dev:shell
```

Or start apps individually:

```bash
pnpm --filter @full-monorepo/shell run dev
pnpm --filter @full-monorepo/<module-name> run dev   # watch build
pnpm --filter @full-monorepo/<module-name> run serve  # preview
```

## Modules

| Path | Package | Port | Type |
|------|---------|------|------|
| `apps/shell` | `@full-monorepo/shell` | 3000 | Host (shell) |
| `apps/dashboard` | `@full-monorepo/dashboard` | 3001 | Feature module |
| `apps/profile` | `@full-monorepo/profile` | 3002 | Feature module |

## Adding a new module

```bash
create-mfe add my-new-module
```

This will:
1. Scaffold `apps/my-new-module/` with vite.config, tsconfig, and source files
2. Register it in `mfe.config.json`
3. Print the remote entry URL to paste into the shell's `vite.config.ts`

## Shared packages

| Package | What it exports |
|---------|----------------|
| `@full-monorepo/ui` | Button, Card, Badge and the `cn()` utility |
| `@full-monorepo/utils` | `useLocalStorage`, `useDebounce`, `useFetch`, format helpers |
| `@full-monorepo/store` | `useStore` — Zustand store with UI + notification slices |
| `@full-monorepo/auth` | `AuthProvider`, `useAuth`, `ProtectedRoute` |

## Build & deploy

Each app builds to its own `dist/` folder and can be deployed to any static host.
The shell fetches remote entry files at runtime, so modules can be deployed independently.

```bash
pnpm build       # build all apps & packages
```
