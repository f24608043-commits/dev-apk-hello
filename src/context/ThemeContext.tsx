import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';
type ColorScheme = 'default' | 'green-gold' | 'mono';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setTheme: (mode: ThemeMode, scheme: ColorScheme) => void;
  toggleThemeMode: () => void;
  toggleColorScheme: () => void;
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'light';
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme');
    return (saved as ColorScheme) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    localStorage.setItem('colorScheme', colorScheme);
    
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove(
      'theme-light-default',
      'theme-light-green-gold',
      'theme-light-mono',
      'theme-dark-default',
      'theme-dark-green-gold',
      'theme-dark-mono'
    );
    
    // Add current theme classes
    root.classList.add(`theme-${themeMode}-${colorScheme}`);
  }, [themeMode, colorScheme]);

  const setTheme = (mode: ThemeMode, scheme: ColorScheme) => {
    setThemeMode(mode);
    setColorScheme(scheme);
  };

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleColorScheme = () => {
    const schemes: ColorScheme[] = ['default', 'green-gold', 'mono'];
    const currentIndex = schemes.indexOf(colorScheme);
    const nextIndex = (currentIndex + 1) % schemes.length;
    setColorScheme(schemes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ 
      themeMode, 
      colorScheme, 
      setTheme, 
      toggleThemeMode, 
      toggleColorScheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
