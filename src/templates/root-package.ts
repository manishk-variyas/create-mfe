
export function genRootPackageJson(name: string, pm: string, includeApi = false): object {
  const isYarn = pm === 'yarn';
  const isPnpm = pm === 'pnpm';

  const workspacesField = isYarn || pm === 'npm'
    ? { workspaces: ['apps/*', 'packages/*', ...(includeApi ? ['api/*'] : [])] }
    : {};

  // ─── Script helpers ────────────────────────────────────────────────────────
  // @originjs/vite-plugin-federation does NOT work with Vite's HMR dev server
  // for remote apps. The correct local dev workflow is:
  //
  //   Terminal 1 → pnpm dev:remotes   (vite build --watch for every non-shell app)
  //   Terminal 2 → pnpm dev:shell     (vite dev for the shell; remotes reload on rebuild)
  //
  // Or run everything built/previewed via `pnpm serve` (no HMR).

  const remoteAppsFilter    = `'./apps/!(*shell)'`;
  const allAppsFilter       = `'./apps/*'`;

  const devRemotes = isPnpm
    ? `pnpm --filter ${remoteAppsFilter} --parallel run dev`
    : isYarn
    ? `yarn workspaces foreach --parallel --exclude @${name}/shell run dev`
    : `npm run dev --workspaces`;

  const devShell = isPnpm
    ? `pnpm --filter @${name}/shell run dev`
    : isYarn
    ? `yarn workspace @${name}/shell dev`
    : `npm run dev --workspace=apps/shell`;

  // `serve` = build then vite preview for every app (all self-contained)
  const serveAll = isPnpm
    ? `pnpm --filter ${allAppsFilter} --parallel run serve`
    : isYarn
    ? `yarn workspaces foreach --parallel run serve`
    : `npm run serve --workspaces`;

  const serveRemotes = isPnpm
    ? `pnpm --filter ${remoteAppsFilter} --parallel run serve`
    : isYarn
    ? `yarn workspaces foreach --parallel --exclude @${name}/shell run serve`
    : `npm run serve --workspaces`;

  const scripts: Record<string, string> = {
    // ── Local development ────────────────────────────────────────────────
    // Terminal 1: pnpm dev:remotes  → vite build --watch (rebuilds on save)
    // Terminal 2: pnpm dev:shell    → vite dev with HMR
    // (after each remote rebuild, the shell live-reloads the new remoteEntry)
    'dev:remotes':   devRemotes,
    'dev:shell':     devShell,

    // ── Full preview (build everything, no HMR) ──────────────────────────
    // Each app's `serve` script does: vite build && vite preview
    serve: serveAll,
    'serve:remotes': serveRemotes,

    // ── Production build ─────────────────────────────────────────────────
    build: isPnpm
      ? 'pnpm -r run build'
      : isYarn
      ? 'yarn workspaces run build'
      : 'npm run build --workspaces --if-present',
    'build:packages': isPnpm
      ? 'pnpm --filter "./packages/**" run build'
      : 'npm run build --workspaces --if-present',

    typecheck: isPnpm ? 'pnpm -r run typecheck' : 'npx tsc --noEmit',
    lint: isPnpm ? 'pnpm -r run lint' : 'npm run lint --workspaces --if-present',
  };

  if (includeApi) {
    scripts['dev:api'] = 'pnpm --filter @full-monorepo/api run dev';
  }

  return {
    name,
    version: '0.0.0',
    private: true,
    type: 'module',
    ...workspacesField,
    scripts,
    devDependencies: {
      typescript: '^5.3.3',
    },
  };
}
