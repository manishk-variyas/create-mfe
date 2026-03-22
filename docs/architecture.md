# Monorepo Architecture

`create-mfe` scaffolds a highly structured, scalable monorepo designed for high-performing teams.

## Directory Structure

```text
/
├── apps/
│   ├── shell/           # Host application (Orchestrator)
│   ├── dashboard/       # Feature module A (Remote)
│   └── profile/         # Feature module B (Remote)
├── packages/
│   ├── ui/              # Shared Shadcn UI components
│   ├── store/           # Global state (Zustand)
│   ├── auth/            # Auth context & Route guards
│   └── utils/           # Shared hooks & helpers
├── package.json         # Workspace-level package settings
└── mfe.config.json      # Mapping of modules and ports
```

## The Role of the Shell

The **Shell** is the entry point of your application. Its responsibilities are:
- **Routing**: Mapping URL paths to different microfrontend modules.
- **Global Layout**: Nav bars, sidebars, and footer.
- **Provider Injection**: Injecting top-level providers like `QueryClientProvider` and `AuthProvider`.
- **Global State**: Hosting the main Zustand store that remotes can access.

## Feature Modules (Remotes)

Each microfrontend under `apps/` is an independent Vite project.
- **Independence**: They can be developed and tested in isolation.
- **Exposures**: They "expose" components to the Shell.
- **Build-Time Federation**: Because Vite dev server doesn't support Federation out-of-the-box, remotes are built using `vite build --watch` and served using `vite preview` during local development.
- **Consumption**: They consume shared packages from `packages/` via workspace protocols.

## Shared Packages

Shared packages are located in `packages/` and are shared across all microfrontends.
- **Local Consistency**: Teams use the same UI components and utilities.
- **Runtime Optimization**: Common libraries are shared as singletons at runtime, avoiding multiple copies in the browser's memory.
