# Deployment Guide

Deploying a `create-mfe` application is conceptually the same as deploying any static React SPA (Single Page Application), but with the added step of linking the Shell to the Remotes via their production URLs.

Since Vite Module Federation produces pure static files (HTML, JS, CSS), you do not need a Node.js server. Any static host (AWS S3, Vercel, Netlify, Cloudflare Pages, NGINX) will work.

## 1. Environment Variables for Remote URLs

During development, your shell relies on `http://localhost:<port>/assets/remoteEntry.js`. In production, these must point to the actual deployed domains of your remote modules.

We strongly recommend using Vite's `loadEnv` to inject these URLs via `.env` files rather than hardcoding them.

### Step 1: Create `.env` files

In `apps/shell/.env.development`:
```env
VITE_DASHBOARD_URL=http://localhost:3001
VITE_PROFILE_URL=http://localhost:3002
```

In `apps/shell/.env.production`:
```env
VITE_DASHBOARD_URL=https://dashboard.my-mfe-app.com
VITE_PROFILE_URL=https://profile.my-mfe-app.com
```

### Step 2: Update `apps/shell/vite.config.ts`

Modify your shell's Vite config to load the environment variables:

```typescript
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ command, mode }) => {
  // Load env variables based on the current mode (development vs production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes: {
          'dashboard': `${env.VITE_DASHBOARD_URL}/assets/remoteEntry.js`,
          'profile': `${env.VITE_PROFILE_URL}/assets/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        },
      }),
    ],
    // ... rest of config
  };
});
```

## 2. Building for Production

To build the entire monorepo (shared packages + all apps) for deployment:

```bash
pnpm run build
```

This creates a `dist/` folder inside every application:
- `apps/shell/dist/`
- `apps/dashboard/dist/`
- `apps/profile/dist/`

These folders contain everything needed to host that specific piece of the microfrontend.

## 3. Hosting Requirements

You can deploy the contents of each `dist/` folder to independent static hosting providers. However, you must ensure two critical behaviors are configured on the servers hosting the **remotes**:

### Requirement A: CORS (Cross-Origin Resource Sharing)
Because the Shell (e.g., hosted on `app.com`) will be fetching `remoteEntry.js` and JavaScript chunks from the Remotes (e.g., hosted on `dashboard.app.com`), the remote servers **MUST** return `Access-Control-Allow-Origin` headers.

If you are using **AWS S3 / Cloudfront**, **Vercel**, or **Netlify**, you must add a configuration file to the remote's `public/` directory or deployment settings instructing the host to allow CORS.

**Vercel Example (`vercel.json` in the remote workspace):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" }
      ]
    }
  ]
}
```

### Requirement B: Single Page App (SPA) Routing
If your remotes have their own internal routing, ensure the static host redirects 404s back to `index.html`.

## 4. Deploy to Netlify

Netlify is a popular choice for deploying microfrontends. Here's how to deploy your create-mfe project:

### Option A: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build all apps
pnpm run build

# Deploy shell (your main app)
cd apps/shell
netlify deploy --prod --dir=dist

# Deploy each remote module
cd ../dashboard
netlify deploy --prod --dir=dist
```

### Option B: Netlify UI (Git-based Deploy)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure the build settings:
   - **Build command**: `pnpm run build`
   - **Publish directory**: `apps/shell/dist`
6. Click "Deploy"

### Netlify Configuration File

Create a `netlify.toml` in your project root for each deployed app:

```toml
[build]
  command = "pnpm run build"
  publish = "apps/shell/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

For remote modules, create separate `netlify.toml` files in each app's folder:

```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

### Deploying with API

If your project includes an API server, you'll need to deploy it separately since it's a Node.js application:

1. **Option 1**: Deploy API to a separate service (Railway, Render, Fly.io)
2. **Option 2**: Use Netlify Functions

For option 2, create a `netlify/functions` folder and move your Express server code there, or consider deploying the API independently on a Node.js hosting platform.

### Environment Variables in Netlify

In your Netlify site settings, add environment variables:

```
VITE_API_URL=https://your-api-domain.com/api
VITE_DASHBOARD_URL=https://dashboard-your-site.netlify.app
VITE_PROFILE_URL=https://profile-your-site.netlify.app
```

## 5. Independent Deployments

The primary benefit of microfrontends is independent deployments. Once the Shell is deployed, you do **not** need to rebuild or redeploy the Shell when a Remote updates.

When you modify the `dashboard` module:
1. Run `pnpm --filter dashboard run build`
2. Deploy the new `apps/dashboard/dist` to your dashboard Netlify site
3. Users refreshing the Shell will instantly receive the updated `remoteEntry.js` from the dashboard domain.
