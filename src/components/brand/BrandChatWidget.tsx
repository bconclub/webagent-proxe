'use client'

import React from 'react';
import { ChatWidget } from '@/src/components/shared/ChatWidget';
import { ThemeProvider } from './ThemeProvider';
import { getBrandConfig } from '@/src/configs';

interface BrandChatWidgetProps {
  brand: string;
  apiUrl?: string;
}

export function BrandChatWidget({ brand, apiUrl }: BrandChatWidgetProps) {
  const config = getBrandConfig(brand);

  return (
    <ThemeProvider brand={brand}>
      <ChatWidget brand={brand} config={config} apiUrl={apiUrl} />
    </ThemeProvider>
  );
}

