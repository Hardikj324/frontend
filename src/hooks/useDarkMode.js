import { useUIStore } from '../store/uiStore';
import { useEffect } from 'react';

export const useDarkMode = () => {
  const { darkMode, setDarkMode } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
    // Store preference
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch (_) {}
  }, [darkMode]);

  return { darkMode, setDarkMode, toggleDarkMode: () => setDarkMode(!darkMode) };
};