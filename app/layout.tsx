import type { Metadata, Viewport } from 'next'
import '@/src/styles/globals.css'
import '@/src/styles/themes/proxe.css'
import '@/src/styles/themes/windchasers.css'

export const metadata: Metadata = {
  title: 'PROXe',
  description: 'AI Operations System For Business',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-brand="proxe" data-theme="purple-frost" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Blinker:wght@200;300;400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

