'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import { BlobBackground } from '@/src/components/shared/BlobBackground';

export default function HomePage() {
  // Use environment variable for API URL if set, otherwise let it default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main>
      <BlobBackground brand="proxe" />
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

