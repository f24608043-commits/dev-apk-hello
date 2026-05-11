import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'default' | 'green-lime';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-default', 'theme-green-lime');
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'default' ? 'green-lime' : 'default');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
