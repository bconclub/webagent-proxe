'use client';

import React from 'react';
import { ChatWidget } from '@/windchasers/components/ChatWidget';
import '@/windchasers/styles/theme.css';

export default function WindchasersPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>Windchasers Aviation Academy</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
          Your gateway to aviation excellence. Explore our courses and start your journey today.
        </p>
      </div>
      <ChatWidget />
    </div>
  );
}
