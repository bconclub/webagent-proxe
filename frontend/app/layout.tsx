import type { Metadata, Viewport } from 'next'
import '../src/styles/globals.css'
import '../src/styles/themes/proxe.css'
import '../src/styles/themes/windchasers.css'

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
    <html lang="en" data-brand="proxe" data-theme="purple-frost">
      <body>{children}</body>
    </html>
  )
}

