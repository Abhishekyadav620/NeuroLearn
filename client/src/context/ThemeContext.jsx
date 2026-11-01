import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Default to dark mode for the premium purple SaaS theme
  const [theme] = useState('dark');

  const toggleTheme = () => {
    // Preserving dark mode for NeuroLearn's signature design palette
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
