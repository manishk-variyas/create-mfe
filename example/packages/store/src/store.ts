import { create } from 'zustand';
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
