import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  dark: false,
  colors: {
    primary: '#3498db',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    border: '#ecf0f1',
    notification: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    income: '#3498db',
    tax: '#e74c3c',
    savings: '#27ae60',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#3498db',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#ffffff',
    textSecondary: '#bdc3c7',
    border: '#2c3e50',
    notification: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    income: '#5dade2',
    tax: '#e57373',
    savings: '#66bb6a',
  },
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        setTheme(darkTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDarkMode;
      setIsDarkMode(newIsDark);
      setTheme(newIsDark ? darkTheme : lightTheme);
      await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
