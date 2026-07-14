import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

const baseTheme = {
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, boxShadow: 'none', padding: '6px 16px', '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' } },
        contained: { fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            '& fieldset': { borderColor: '#c4c4c4' },
            '&:hover fieldset': { borderColor: '#000' },
            '&.Mui-focused fieldset': { borderColor: 'var(--primary-main, #1976d2)', borderWidth: 2 },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' },
      },
    },
  },
};

const ACCENT_COLORS = [
  { name: 'Blue', primary: '#1976d2', dark: '#1565c0' },
  { name: 'Indigo', primary: '#3f51b5', dark: '#303f9f' },
  { name: 'Teal', primary: '#00897b', dark: '#00695c' },
  { name: 'Green', primary: '#388e3c', dark: '#2e7d32' },
  { name: 'Red', primary: '#d32f2f', dark: '#c62828' },
  { name: 'Orange', primary: '#f57c00', dark: '#e65100' },
  { name: 'Purple', primary: '#7b1fa2', dark: '#6a1b9a' },
  { name: 'Grey', primary: '#546e7a', dark: '#37474f' },
];

function buildPalette(mode, accent) {
  const isDark = mode === 'dark';
  return {
    mode,
    primary: {
      main: accent?.primary || '#1976d2',
      light: isDark ? '#e3f2fd' : '#42a5f5',
      dark: accent?.dark || '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: isDark ? '#ce93d8' : '#9c27b0',
      light: isDark ? '#f3e5f5' : '#ba68c8',
      dark: isDark ? '#ab47bc' : '#7b1fa2',
    },
    background: isDark
      ? { default: '#121212', paper: '#1e1e1e' }
      : { default: '#f4f6f8', paper: '#ffffff' },
    text: isDark
      ? { primary: '#ffffff', secondary: '#b0b0b0' }
      : { primary: '#202124', secondary: '#5f6368' },
  };
}

function injectCSSVars(mode, accent) {
  const root = document.documentElement;
  const isDark = mode === 'dark';

  // Sidebar
  root.style.setProperty('--sidebar-bg', isDark ? '#1a1a2e' : '#ffffff');
  root.style.setProperty('--sidebar-text', isDark ? '#e0e0e0' : '#333333');
  root.style.setProperty('--sidebar-header-bg', isDark ? '#16213e' : '#f8fafc');
  root.style.setProperty('--sidebar-header-text', isDark ? '#90caf9' : '#0b3c91');
  root.style.setProperty('--sidebar-hover', isDark ? '#0f3460' : '#e2e8f0');
  root.style.setProperty('--sidebar-border', isDark ? '#2a2a4a' : '#d1d5db');
  root.style.setProperty('--sidebar-active-bg', isDark ? '#0f3460' : '#e8f0fe');

  // Header
  const primaryVal = accent?.primary || '#1976d2';
  const darkVal = accent?.dark || '#1565c0';
  root.style.setProperty('--header-bg', isDark ? '#1a1a2e' : primaryVal);
  root.style.setProperty('--header-nav-bg', isDark ? '#16213e' : darkVal);
  root.style.setProperty('--text-white', isDark ? '#e0e0e0' : '#ffffff');
  root.style.setProperty('--nav-hover', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)');
  root.style.setProperty('--accent', isDark ? '#90caf9' : '#ffd700');

  // Layout
  root.style.setProperty('--layout-bg', isDark ? '#121212' : '#f9f9f9');

  // Dropdowns
  root.style.setProperty('--dropdown-bg', isDark ? '#1e1e1e' : '#ffffff');
  root.style.setProperty('--dropdown-text', isDark ? '#e0e0e0' : '#333333');
  root.style.setProperty('--dropdown-hover-bg', isDark ? '#2a2a4a' : '#f5f8ff');
  root.style.setProperty('--dropdown-hover-text', isDark ? '#90caf9' : '#0b3c91');
  root.style.setProperty('--dropdown-border', isDark ? '#333' : '#e0e0e0');
  root.style.setProperty('--notif-bg', isDark ? '#1e1e1e' : '#ffffff');
  root.style.setProperty('--notif-hover', isDark ? '#2a2a4a' : '#f1f5f9');

  // Primary accent
  root.style.setProperty('--primary-main', primaryVal);

  // Footer
  root.style.setProperty('--footer-bg', isDark ? '#1a1a2e' : primaryVal);
  root.style.setProperty('--footer-toggle-bg', isDark ? '#12121f' : darkVal);
  root.style.setProperty('--footer-toggle-hover', isDark ? '#0f3460' : primaryVal);
  root.style.setProperty('--footer-section-title', isDark ? '#90caf9' : '#ffffffcc');
  root.style.setProperty('--footer-icon', isDark ? '#90caf9' : '#ffffffcc');
  root.style.setProperty('--footer-link-hover', isDark ? '#90caf9' : '#ffffffcc');

  // Chatbot
  root.style.setProperty('--chatbot-bg', primaryVal);

  // Heading
  root.style.setProperty('--heading-color', primaryVal);
}

export function ThemeContextProvider({ children }) {
  const storedMode = localStorage.getItem('themeMode') || 'light';
  const storedAccent = localStorage.getItem('themeAccent');
  const [mode, setMode] = useState(storedMode);
  const [accent, setAccent] = useState(storedAccent ? JSON.parse(storedAccent) : ACCENT_COLORS[0]);

  useEffect(() => {
    injectCSSVars(mode, accent);
  }, [mode, accent]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  }, []);

  const setAccentColor = useCallback((color) => {
    setAccent(color);
    localStorage.setItem('themeAccent', JSON.stringify(color));
  }, []);

  const theme = createTheme({
    ...baseTheme,
    palette: buildPalette(mode, accent),
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, accent, setAccentColor, ACCENT_COLORS }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeContext);
