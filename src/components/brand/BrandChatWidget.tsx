'use client'

import React, { useState, useEffect } from 'react';
import { ChatWidget } from '@/src/components/shared/ChatWidget';
import { ThemeProvider } from './ThemeProvider';
import { getBrandConfig } from '@/src/configs';

interface BrandChatWidgetProps {
  brand: string;
  apiUrl?: string;
}

type WidgetStyle = 'searchbar' | 'bubble';

interface WidgetStyleResponse {
  style: WidgetStyle;
}

export function BrandChatWidget({ brand, apiUrl }: BrandChatWidgetProps) {
  const config = getBrandConfig(brand);
  const [widgetStyle, setWidgetStyle] = useState<WidgetStyle>('searchbar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWidgetStyle = async () => {
      try {
        // Get dashboard URL from environment variable or use default
        const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dash.goproxe.com';
        const apiEndpoint = `${dashboardUrl}/api/settings/widget-style`;

        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // CORS is handled by the API, but we can add credentials if needed
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch widget style: ${response.status}`);
        }

        const data: WidgetStyleResponse = await response.json();
        
        // Validate the response
        if (data.style === 'searchbar' || data.style === 'bubble') {
          setWidgetStyle(data.style);
          
          // Optional: Cache in localStorage
          try {
            localStorage.setItem('proxe.widgetStyle', data.style);
          } catch (e) {
            // Ignore localStorage errors (e.g., in private browsing)
          }
        } else {
          console.warn('[BrandChatWidget] Invalid widget style received:', data.style);
          // Fallback to default
        }
      } catch (error) {
        console.error('[BrandChatWidget] Error fetching widget style:', error);
        
        // Try to load from cache if fetch failed
        try {
          const cachedStyle = localStorage.getItem('proxe.widgetStyle');
          if (cachedStyle === 'searchbar' || cachedStyle === 'bubble') {
            setWidgetStyle(cachedStyle as WidgetStyle);
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        // Fallback to default "searchbar"
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch widget style on mount
    fetchWidgetStyle();
  }, []);

  return (
    <ThemeProvider brand={brand}>
      <ChatWidget 
        brand={brand} 
        config={config} 
        apiUrl={apiUrl} 
        widgetStyle={widgetStyle}
      />
    </ThemeProvider>
  );
}

