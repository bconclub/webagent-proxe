'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';
import Header from '@/src/components/shared/Header';
import BlurText from '@/src/components/shared/BlurText';
import styles from './page.module.css';

export default function ProxePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'transparent' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, pointerEvents: 'none', width: '100%', height: '100%', minWidth: '100%', minHeight: '100%' }}>
        <DarkVeil speed={0.8} warpAmount={0.3} />
      </div>
      <Header />
      <section className={styles.heroSection}>
        <BlurText
          text="AI Agents That Run Your Business Better"
          delay={150}
          animateBy="words"
          direction="top"
          className={styles.heroTitle}
        />
        <p className={styles.heroSubtitle}>Every <b>Customer</b> touch point automated with PROXe</p>
      </section>
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

