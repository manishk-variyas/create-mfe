# Core Features

Explore the production-ready features included in every `create-mfe` project.

## 🧩 Module Federation

`create-mfe` uses Vite's and Rollup's Module Federation plugins to load remote microfrontends at runtime.

- **Shared Dependencies**: Essential libraries like `react`, `react-dom`, and `@tanstack/react-query` are shared as singletons.
- **Dynamic Resolution**: Remote entries are mapped in `vite.config.ts`, making cross-module communication easy.
- **Lazy Loading**: Automatic code-splitting across the whole application.

### Example Remote Loading
```tsx
const Dashboard = React.lazy(() => import('dashboard/App'));

// Loaded via React.Suspense
<React.Suspense fallback={<PageLoader />}>
  <Dashboard />
</React.Suspense>
```

## 📡 React Query (TanStack Query)

Standardize data fetching across your microfrontends with a single `QueryClient` shared by the host shell.

- **Centralized Client**: One `QueryClientProvider` in the Shell, shared by all loaded remotes.
- **Pre-scaffolded Examples**: Each feature module comes with a boilerplate query hook showing how to fetch remote state.
- **React Query Devtools**: Built-in devtools in the Shell for inspection.

## 🎨 Shadcn UI & Shared UI Package

Maintain consistent design throughout independent microfrontends using a centralized `@workspace/ui` package.

- **Atomic Design**: Shared components like `Button`, `Card`, and `Badge` are written once and used everywhere.
- **Tailwind Sync**: Consistent Tailwind configuration and global styles ensure no UI drift between teams.
- **Pre-installed Plugins**: Includes `class-variance-authority` and `tailwind-merge` for robust styling.

### Using Shared UI
```tsx
import { Button, Card } from '@my-app/ui';

export function MyFeature() {
  return (
    <Card>
      <Button variant="outline">Shared Action</Button>
    </Card>
  );
}
```

## 🔒 Shared Store & Auth

`create-mfe` provides infrastructure for cross-module features.

- **Global Store**: Centralized Zustand store accessible by any microfrontend.
- **Protected Routes**: Centralized authentication context and route guards in `@workspace/auth`.
- **Consistent Icons**: Lucide-React pre-configured in the shared UI.
