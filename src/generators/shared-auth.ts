import path from 'path';
import { writeFile, writeJson } from '../utils/fs';

export async function generateSharedAuth(pkgDir: string, workspaceName: string): Promise<void> {
  await writeJson(path.join(pkgDir, 'package.json'), {
    name: `@${workspaceName}/auth`,
    version: '0.0.0',
    private: true,
    type: 'module',
    main: './src/index.ts',
    types: './src/index.ts',
    peerDependencies: {
      react: '^18.0.0',
      'react-router-dom': '^6.0.0',
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      typescript: '^5.3.3',
    },
  });

  await writeFile(path.join(pkgDir, 'src', 'AuthContext.tsx'), `import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  /** Provide your own fetch-user logic */
  onLogin?: (email: string, password: string) => Promise<User>;
}

export function AuthProvider({ children, onLogin }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedIn = onLogin
        ? await onLogin(email, password)
        : { id: '1', email, name: email.split('@')[0], roles: ['user'] };
      setUser(loggedIn);
    } finally {
      setIsLoading(false);
    }
  }, [onLogin]);

  const logout = useCallback(() => setUser(null), []);

  const hasRole = useCallback(
    (role: string) => user?.roles.includes(role) ?? false,
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
`);

  await writeFile(path.join(pkgDir, 'src', 'ProtectedRoute.tsx'), `import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required role to access this route */
  requiredRole?: string;
  /** Where to redirect unauthenticated users */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
`);

  await writeFile(path.join(pkgDir, 'src', 'index.ts'), `export { AuthProvider, useAuth } from './AuthContext';
export type { User, AuthContextValue, AuthProviderProps } from './AuthContext';
export { ProtectedRoute } from './ProtectedRoute';
export type { ProtectedRouteProps } from './ProtectedRoute';
`);
}
