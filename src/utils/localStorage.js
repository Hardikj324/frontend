const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  DARK_MODE: 'darkMode',
  SAVED_LOCATIONS: 'savedLocations',
  ALERTS: 'alerts',
};

export const storage = {
    setAccessToken: (token) => localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,token),
    getAccessToken: () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    removeAccessToken: () => localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),

    setRefreshToken: (token) => localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token),
    getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    removeRefreshToken: () => localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),

    setUser: (user) => localStorage.setItem(STORAGE_KEYS.USER,JSON.stringify(user)),
    getUser: () => {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
      },
    removeUser: () => localStorage.removeItem(STORAGE_KEYS.USER),
    
    setDarkMode: (isDark) => localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark)),
    getDarkMode: () => {
    const mode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return mode ? JSON.parse(mode) : true;
    },

    setSavedLocations: (locations) =>
    localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(locations)),
    getSavedLocations: () => {
    const locations = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
    return locations ? JSON.parse(locations) : [];
    },

    setAlerts: (alerts) => localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)),
    getAlerts: () => {
    const alerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return alerts ? JSON.parse(alerts) : [];
    },

    clear: () => localStorage.clear(),

};