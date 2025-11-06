import type { Metadata, Viewport } from 'next'
import { Blinker } from 'next/font/google'
import '@/src/styles/globals.css'
import '@/src/styles/themes/proxe.css'
import '@/src/styles/themes/windchasers.css'

const blinker = Blinker({
  weight: ['100', '200', '300', '400', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-blinker',
})

export const metadata: Metadata = {
  title: 'PROXe',
  description: 'AI Operations System For Business',
  icons: {
    icon: '/assets/proxe/PROXe Favicon.png',
    shortcut: '/assets/proxe/PROXe Favicon.png',
    apple: '/assets/proxe/PROXe Favicon.png',
  },
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
    <html lang="en" data-brand="proxe" data-theme="purple-frost" className={blinker.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

