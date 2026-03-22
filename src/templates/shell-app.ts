import { ModuleConfig, SharedConfig } from '../utils/types';
import { toPascalCase } from '../utils/fs';

export function genShellApp(modules: ModuleConfig[], shared: SharedConfig, workspaceName: string, includeApi = false): string {
  const lazyImports = modules
    .map(m => {
      const pascal = toPascalCase(m.name);
      return `const ${pascal} = React.lazy(() => import('${m.name}/App'));`;
    })
    .join('\n');

  const routes = modules
    .map(m => {
      const pascal = toPascalCase(m.name);
      const routePath = `/${m.name}`;
      const guardOpen  = shared.auth ? `          <ProtectedRoute>\n` : '';
      const guardClose = shared.auth ? `          </ProtectedRoute>\n` : '';
      return (
        `        <Route\n` +
        `          path="${routePath}/*"\n` +
        `          element={\n` +
        `${guardOpen}` +
        `            <React.Suspense fallback={<PageLoader />}>\n` +
        `              <${pascal} />\n` +
        `            </React.Suspense>\n` +
        `${guardClose}` +
        `          }\n` +
        `        />`
      );
    })
    .join('\n');

  const authImport = shared.auth
    ? `import { AuthProvider, ProtectedRoute, useAuth } from '@${workspaceName}/auth';\n`
    : '';

  const storeImport = shared.state
    ? `// Global store is available via useStore from '@${workspaceName}/store'\n`
    : '';

  const authWrap   = (inner: string) =>
    shared.auth
      ? `      <AuthProvider>\n${inner}\n      </AuthProvider>`
      : inner;

  const firstModule = modules[0]?.name ?? 'home';

  return `import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
${shared.reactQuery ? `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
` : ''}${authImport}${storeImport}${lazyImports}

${shared.reactQuery ? 'const queryClient = new QueryClient();\n' : ''}
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span style={{ color: '#888', fontSize: 14 }}>Loading module…</span>
    </div>
  );
}

function Nav() {
  return (
    <nav style={{
      display: 'flex',
      gap: 8,
      padding: '12px 24px',
      borderBottom: '1px solid #e5e7eb',
      background: '#fff',
    }}>
      <span style={{ fontWeight: 600, marginRight: 16 }}>MFE Shell</span>
${modules.map(m => `      <NavLink to="/${m.name}" style={({ isActive }) => ({ color: isActive ? '#2563eb' : '#374151', textDecoration: 'none', fontSize: 14 })}>${toPascalCase(m.name)}</NavLink>`).join('\n')}
    </nav>
  );
}


${shared.auth ? `function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('admin@example.com');

  const handleLogin = async () => {
    await login(email, 'password');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 16 }}>
      <div style={{ padding: 32, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', width: '100%', maxWidth: 400 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 20 }}>Sign in</h2>
        <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14 }}>Enter your email to access the dashboard</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }} 
          />
          <button 
            onClick={handleLogin}
            style={{ padding: '10px', background: '#2563eb', color: '#fff', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}\n` : ''}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
${shared.reactQuery ? '    <QueryClientProvider client={queryClient}>\n' : ''}${authWrap(
  `        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
          <Nav />
          <Routes>
            <Route path="/" element={<Navigate to="/${firstModule}" replace />} />
${shared.auth ? `            <Route path="/login" element={<LoginPage />} />\n` : ''}${routes}
            <Route path="*" element={<div style={{ padding: 24 }}>404 — Page not found</div>} />
          </Routes>
        </div>`
)}
${shared.reactQuery ? '      <ReactQueryDevtools initialIsOpen={false} />\n    </QueryClientProvider>\n' : ''}
    </BrowserRouter>
  );
}
`;
}
