import path from 'path';
import { writeFile, writeJson } from '../utils/fs';

export async function generateSharedUtils(pkgDir: string, workspaceName: string): Promise<void> {
  await writeJson(path.join(pkgDir, 'package.json'), {
    name: `@${workspaceName}/utils`,
    version: '0.0.0',
    private: true,
    type: 'module',
    main: './src/index.ts',
    types: './src/index.ts',
    peerDependencies: {
      react: '^18.0.0',
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      typescript: '^5.3.3',
    },
  });

  await writeFile(path.join(pkgDir, 'src', 'hooks', 'useLocalStorage.ts'), `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('useLocalStorage error:', error);
    }
  };

  return [storedValue, setValue] as const;
}
`);

  await writeFile(path.join(pkgDir, 'src', 'hooks', 'useDebounce.ts'), `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
`);

  await writeFile(path.join(pkgDir, 'src', 'hooks', 'useFetch.ts'), `import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState(prev => ({ ...prev, loading: true, error: null }));

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<T>;
      })
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (!cancelled) setState({ data: null, loading: false, error: error as Error });
      });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}
`);

  await writeFile(path.join(pkgDir, 'src', 'lib', 'format.ts'), `export function formatDate(date: Date | string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
`);

  await writeFile(path.join(pkgDir, 'src', 'index.ts'), `export { useLocalStorage } from './hooks/useLocalStorage';
export { useDebounce } from './hooks/useDebounce';
export { useFetch } from './hooks/useFetch';
export { formatDate, formatCurrency, truncate } from './lib/format';
`);
}
