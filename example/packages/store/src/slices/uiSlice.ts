import { StateCreator } from 'zustand';

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
