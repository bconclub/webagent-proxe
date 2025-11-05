'use client'

import React, { useEffect, useRef } from 'react';
import styles from './CalendlyWidget.module.css';

interface CalendlyWidgetProps {
  url: string;
  onClose?: () => void;
}

export function CalendlyWidget({ url, onClose }: CalendlyWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    
    if (!existingScript && !scriptLoadedRef.current) {
      // Load Calendly script
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        scriptLoadedRef.current = true;
      };

      document.body.appendChild(script);
    } else if (existingScript) {
      scriptLoadedRef.current = true;
    }
  }, []);

  // Initialize Calendly widget when component mounts or URL changes
  useEffect(() => {
    if (!widgetRef.current) return;

    // Clear previous widget
    widgetRef.current.innerHTML = '';
    
    // Create new widget with data-url attribute
    // Calendly script will automatically initialize widgets with class 'calendly-inline-widget'
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'calendly-inline-widget';
    widgetDiv.setAttribute('data-url', url);
    widgetDiv.style.minWidth = '320px';
    widgetDiv.style.height = '700px';
    
    widgetRef.current.appendChild(widgetDiv);

    // If script is already loaded, trigger initialization manually
    // Otherwise, the script will auto-initialize when it loads
    if (scriptLoadedRef.current || window.Calendly) {
      // Widget will be auto-initialized by Calendly script
      // But we can also manually trigger if needed
      const checkAndInit = () => {
        if (window.Calendly && widgetDiv) {
          // Widget should auto-initialize, but we can ensure it
          setTimeout(() => {
            // The widget initializes automatically via data-url attribute
          }, 100);
        }
      };
      
      checkAndInit();
    }
  }, [url]);

  return (
    <div className={styles.calendlyContainer}>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Close booking">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      <div ref={widgetRef} className={styles.calendlyWidget}></div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget?: (options: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

