import { create } from 'zustand';
import { storage } from '../utils/localStorage';

export const useUIStore = create((set) => ({
  darkMode: storage.getDarkMode(),
  sidebarOpen: true,
  selectedWeatherLayer: 'temp',
  notificationQueue: [],
  mapZoom: 2,
  mapCenter: [0, 20],

  setDarkMode: (darkMode) => {
    storage.setDarkMode(darkMode);
    set({ darkMode });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSelectedWeatherLayer: (layer) => set({ selectedWeatherLayer: layer }),

  addNotification: (notification) =>
    set((state) => ({
      notificationQueue: [
        ...state.notificationQueue,
        {
          id: Date.now(),
          ...notification,
        },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notificationQueue: state.notificationQueue.filter((n) => n.id !== id),
    })),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  setMapCenter: (center) => set({ mapCenter: center }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
}));