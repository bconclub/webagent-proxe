'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import { BlobBackground } from '@/src/components/shared/BlobBackground';

export default function WindChasersPage() {
  return (
    <main>
      <BlobBackground brand="windchasers" />
      <BrandChatWidget brand="windchasers" />
    </main>
  )
}

