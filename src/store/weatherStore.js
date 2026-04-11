import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useWeatherStore = create(
  persist(
    (set, get) => ({
      weather: null,
      loading: false,
      error: null,
      selectedLocation: null,
      lastUpdated: null,

      setWeather: (weather) =>
        set({
          weather,
          lastUpdated: new Date(),
          error: null,
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setSelectedLocation: (location) => set({ selectedLocation: location }),

      clearWeather: () =>
        set({
          weather: null,
          selectedLocation: null,
          error: null,
          lastUpdated: null,
        }),

      getFormattedLastUpdated: () => {
        const lastUpdated = get().lastUpdated;
        if (!lastUpdated) return 'Never';
        const now = new Date();
        const diff = Math.floor((now - lastUpdated) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
      },
    }),
    {
      name: 'sky-sight-weather-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist selectedLocation and lastUpdated
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);