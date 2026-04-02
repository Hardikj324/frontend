import { create } from 'zustand';

export const useLocationStore = create((set) => ({
  currentLocation: null,
  savedLocations: [],
  searchHistory: [],
  loading: false,
  error: null,

  setCurrentLocation: (location) => set({ currentLocation: location }),

  setSavedLocations: (locations) => set({ savedLocations: locations }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  addSavedLocation: (location) =>
    set((state) => ({
      savedLocations: [...state.savedLocations, location],
    })),

  removeSavedLocation: (id) =>
    set((state) => ({
      savedLocations: state.savedLocations.filter((loc) => loc.id !== id),
    })),

  addSearchHistory: (query) =>
    set((state) => {
      const filtered = state.searchHistory.filter((q) => q !== query);
      return {
        searchHistory: [query, ...filtered].slice(0, 10),
      };
    }),

  clearSearchHistory: () => set({ searchHistory: [] }),

  clearError: () => set({ error: null }),
}));