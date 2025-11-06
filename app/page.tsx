'use client'

import { ProxeHomepage } from '@/src/components/homepage/ProxeHomepage';
import ColorBends from '@/src/components/shared/ColorBends';
import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <ColorBends
        colors={[
          "#FFD700", // Golden yellow
          "#FF8C00", // Dark orange
          "#FF4500", // Orange red
          "#DC143C", // Crimson
          "#8B008B", // Dark magenta
          "#4B0082", // Indigo
          "#0000FF", // Blue
          "#00CED1"  // Dark turquoise / Cyan
        ]}
        rotation={-45}
        speed={0.2}
        scale={0.8}
        frequency={0.8}
        warpStrength={1.5}
        mouseInfluence={0.6}
        parallax={0.8}
        noise={0.12}
        transparent
      />
      <ProxeHomepage />
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

