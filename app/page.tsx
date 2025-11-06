'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';
import Header from '@/src/components/shared/Header';

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, pointerEvents: 'none' }}>
        <DarkVeil />
      </div>
      <Header />
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

