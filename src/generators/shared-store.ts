import path from 'path';
import { writeFile, writeJson } from '../utils/fs';

export async function generateSharedStore(pkgDir: string, workspaceName: string): Promise<void> {
  await writeJson(path.join(pkgDir, 'package.json'), {
    name: `@${workspaceName}/store`,
    version: '0.0.0',
    private: true,
    type: 'module',
    main: './src/index.ts',
    types: './src/index.ts',
    dependencies: {
      zustand: '^4.5.0',
    },
    peerDependencies: {
      react: '^18.0.0',
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      typescript: '^5.3.3',
    },
  });

  await writeFile(path.join(pkgDir, 'src', 'slices', 'uiSlice.ts'), `import { StateCreator } from 'zustand';

export interface UiSlice {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  setTheme: (theme: UiSlice['theme']) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  theme: 'system',
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
});
`);

  await writeFile(path.join(pkgDir, 'src', 'slices', 'notificationSlice.ts'), `import { StateCreator } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface NotificationSlice {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const createNotificationSlice: StateCreator<NotificationSlice> = (set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
});
`);

  await writeFile(path.join(pkgDir, 'src', 'store.ts'), `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UiSlice, createUiSlice } from './slices/uiSlice';
import { NotificationSlice, createNotificationSlice } from './slices/notificationSlice';

export type RootStore = UiSlice & NotificationSlice;

export const useStore = create<RootStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createUiSlice(...args),
        ...createNotificationSlice(...args),
      }),
      {
        name: 'mfe-store',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'MFE Store' }
  )
);
`);

  await writeFile(path.join(pkgDir, 'src', 'index.ts'), `export { useStore } from './store';
export type { RootStore } from './store';
export type { UiSlice } from './slices/uiSlice';
export type { NotificationSlice, Notification } from './slices/notificationSlice';
`);
}
