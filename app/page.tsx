'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

