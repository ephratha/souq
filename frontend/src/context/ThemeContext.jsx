/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const setLightMode = () => {
    setDarkMode(false);
  };

  const setDarkModeTheme = () => {
    setDarkMode(true);
  };

  // Dynamic color values for easy access
  const colors = {
    light: {
      background: '#F9F6F0',
      text: '#150C0C',
      primary: '#E8B86B',
      secondary: '#F5E6D3',
      accent: '#FDF8F0',
      champagne: '#FDF8F0',
      honeyGarlic: '#A0522D',
      whiskeySour: '#E8B86B',
      burntCoffee: '#F5E6D3',
      balsamico: '#F9F6F0',
    },
    dark: {
      background: '#150C0C',
      text: '#EACEAA',
      primary: '#D39858',
      secondary: '#34150F',
      accent: '#EACEAA',
      champagne: '#EACEAA',
      honeyGarlic: '#85431E',
      whiskeySour: '#D39858',
      burntCoffee: '#34150F',
      balsamico: '#150C0C',
    },
  };

  const currentColors = darkMode ? colors.dark : colors.light;

  const value = {
    darkMode,
    toggleTheme,
    setLightMode,
    setDarkModeTheme,
    colors: currentColors,
    allColors: colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Optional: CSS variables injection component
export const ThemeStyles = () => {
  const { colors } = useTheme();
  
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [colors]);

  return null;
};