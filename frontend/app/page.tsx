'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import { BlobBackground } from '@/src/components/shared/BlobBackground';

export default function HomePage() {
  return (
    <main>
      <BlobBackground brand="proxe" />
      <BrandChatWidget brand="proxe" />
    </main>
  )
}

