# Troubleshooting

Helpful tips and solutions to common microfrontend and monorepo issues.

## Common Issues

### ❌ `vitepress: command not found`

**Symptom**: Error when running `npm run docs:dev`.

**Resolution**: Ensure you've run `npm install` in the root and in the `/docs` directory. `create-mfe` project docs use a dedicated sub-package. If it's your first time, run:
```bash
npm run --prefix docs install
```

### ❌ `Failed to resolve import` from `@workspace/ui`

**Symptom**: Your microfrontend fails to find the shared UI package during build or development.

**Resolution**:
1. Check the `package.json` of your app (e.g., `apps/dashboard/package.json`) to see if it includes `@workspace/ui`.
2. Ensure you have the `@workspace/ui` in your monorepo (`packages/ui`).
3. If using `pnpm`, run `pnpm install` in the root to ensure workspace symlinks are created.

### ❌ `react: singleton required`

**Symptom**: React components throwing version mismatch errors or state being reset.

**Resolution**:
By default, `create-mfe` ensures React is shared as a singleton. If you add new libraries (like React Hot Toast) that must maintain a single state, add them to the `shared` section in `vite.config.ts` for both the Shell and each Remote.

```typescript
// vite.config.ts
federation({
  shared: {
    'my-singleton-lib': { singleton: true }
  }
})
```

### ❌ Port Conflict

**Symptom**: One of your microfrontends fails to start because the port is already in use.

**Resolution**:
Check `mfe.config.json` in the root for the port mapping and update any conflicting ports. Don't forget to update the Shell's `vite.config.ts` as well if you change a remote module's port.

### ❌ CORS Missing Header

**Symptom**: Browser blocks loading of a remote module.

**Resolution**:
1. Check your network tab in the browser console. Look for `Access-Control-Allow-Origin` header in the remote entry response.
2. In production, double check your hosting provider and CDN configuration for CORS headers.

### ❌ Tailwind classes from `@workspace/ui` aren't applying

**Symptom**: You import a UI component (like a Button) but it renders with raw browser defaults.

**Resolution**:
Tailwind CSS needs to know where to find your class names to generate the CSS. `create-mfe` configures this for you, but if you modified the configuration, verify these three things in the consuming app (the shell or module):
1. `tailwind.config.ts` must include `'../../packages/ui/src/**/*.{ts,tsx}'` in the `content` array so Tailwind scans the shared package.
2. `postcss.config.js` exists in the app's root directory.
3. `src/index.css` is imported in `src/main.tsx`.
