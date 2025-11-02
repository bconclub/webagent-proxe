'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { BrandConfig, getBrandConfig } from '@/src/configs';
import '@/src/styles/themes/proxe.css';
import '@/src/styles/themes/windchasers.css';

interface ThemeContextType {
  config: BrandConfig;
  applyTheme: (brand: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  brand, 
  children 
}: { 
  brand: string; 
  children: ReactNode;
}) {
  const config = getBrandConfig(brand);

  useEffect(() => {
    applyTheme(brand);
  }, [brand]);

  const applyTheme = (brandName: string) => {
    // Set data attributes for CSS selectors - CSS variables are defined in theme CSS files
    const root = document.documentElement;
    root.setAttribute('data-brand', brandName.toLowerCase());
    root.setAttribute('data-theme', brandName === 'proxe' ? 'purple-frost' : 'warm-frost');
  };

  return (
    <ThemeContext.Provider value={{ config, applyTheme }}>
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

