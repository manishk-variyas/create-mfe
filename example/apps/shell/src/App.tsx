import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, ProtectedRoute, useAuth } from '@full-monorepo/auth';
// Global store is available via useStore from '@full-monorepo/store'
const Dashboard = React.lazy(() => import('dashboard/App'));
const Profile = React.lazy(() => import('profile/App'));

const queryClient = new QueryClient();

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
      <NavLink to="/dashboard" style={({ isActive }) => ({ color: isActive ? '#2563eb' : '#374151', textDecoration: 'none', fontSize: 14 })}>Dashboard</NavLink>
      <NavLink to="/profile" style={({ isActive }) => ({ color: isActive ? '#2563eb' : '#374151', textDecoration: 'none', fontSize: 14 })}>Profile</NavLink>
    </nav>
  );
}


function LoginPage() {
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
}


export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
          <Nav />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoader />}>
              <Dashboard />
            </React.Suspense>
          </ProtectedRoute>
          }
        />
        <Route
          path="/profile/*"
          element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoader />}>
              <Profile />
            </React.Suspense>
          </ProtectedRoute>
          }
        />
            <Route path="*" element={<div style={{ padding: 24 }}>404 — Page not found</div>} />
          </Routes>
        </div>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>

    </BrowserRouter>
  );
}
