import { ModuleConfig } from '../utils/types';

export function genReadme(name: string, modules: ModuleConfig[]): string {
  const moduleRows = modules
    .map(m => `| \`apps/${m.name}\` | \`@${name}/${m.name}\` | ${m.port} | Feature module |`)
    .join('\n');

  return `# ${name}

Microfrontend monorepo scaffolded with [create-mfe](https://github.com/your-org/create-mfe).

## Architecture

This workspace uses **Vite Module Federation** (\`@originjs/vite-plugin-federation\`) so each
module is developed, built, and deployed independently while sharing a single React instance.

\`\`\`
${name}/
├── apps/
│   ├── shell/          Host application (port 3000)
${modules.map(m => `│   └── ${m.name}/         Feature module (port ${m.port})`).join('\n')}
├── packages/
│   ├── ui/             Shared shadcn/ui components
│   ├── utils/          Shared hooks & helpers
│   ├── store/          Zustand global state
│   └── auth/           Auth context & route guards
└── mfe.config.json     CLI workspace manifest
\`\`\`

## Getting started

\`\`\`bash
pnpm install
\`\`\`

> **Why 3 terminals?**
> [\`@originjs/vite-plugin-federation\`](https://github.com/originjs/vite-plugin-federation) does not
> support Vite's HMR dev server for **remote** apps — \`remoteEntry.js\` is only emitted after a build.
> Remotes must be built and served via \`vite preview\`.

\`\`\`bash
# Terminal 1 — watch-build all remote modules on every file change
pnpm dev:remotes

# Terminal 2 — serve the built remotes (run AFTER Terminal 1 has finished its first build)
pnpm serve:remotes

# Terminal 3 — shell app with full HMR
pnpm dev:shell
\`\`\`

Or start apps individually:

\`\`\`bash
pnpm --filter @${name}/shell run dev
pnpm --filter @${name}/<module-name> run dev   # watch build
pnpm --filter @${name}/<module-name> run serve  # preview
\`\`\`

## Modules

| Path | Package | Port | Type |
|------|---------|------|------|
| \`apps/shell\` | \`@${name}/shell\` | 3000 | Host (shell) |
${moduleRows}

## Adding a new module

\`\`\`bash
create-mfe add my-new-module
\`\`\`

This will:
1. Scaffold \`apps/my-new-module/\` with vite.config, tsconfig, and source files
2. Register it in \`mfe.config.json\`
3. Print the remote entry URL to paste into the shell's \`vite.config.ts\`

## Shared packages

| Package | What it exports |
|---------|----------------|
| \`@${name}/ui\` | Button, Card, Badge and the \`cn()\` utility |
| \`@${name}/utils\` | \`useLocalStorage\`, \`useDebounce\`, \`useFetch\`, format helpers |
| \`@${name}/store\` | \`useStore\` — Zustand store with UI + notification slices |
| \`@${name}/auth\` | \`AuthProvider\`, \`useAuth\`, \`ProtectedRoute\` |

## Build & deploy

Each app builds to its own \`dist/\` folder and can be deployed to any static host.
The shell fetches remote entry files at runtime, so modules can be deployed independently.

\`\`\`bash
pnpm build       # build all apps & packages
\`\`\`
`;
}
