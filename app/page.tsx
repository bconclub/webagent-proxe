'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      {/* First Section - DarkVeil */}
      <section style={{ width: '100%', height: '600px', position: 'relative' }}>
        <DarkVeil />
      </section>
      
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

