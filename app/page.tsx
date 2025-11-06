'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';
import Header from '@/src/components/shared/Header';
import styles from './page.module.css';

export default function HomePage() {
  // Use environment variable for API URL if set, otherwise let it default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;

  return (
    <main style={{ margin: 0, padding: 0, width: '100%', height: '100%', overflow: 'hidden', background: 'transparent', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <DarkVeil />
      </div>
      <Header />
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>AI Agents that run your business better</h1>
          <p className={styles.heroSubtitle}>Every business touch point Automated with PROXe</p>
          <div className={styles.arrowDown}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </section>
      <section className={styles.cardsSection}>
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Web</h3>
            <p className={styles.cardLabel}>PROXe</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>WhatsApp</h3>
            <p className={styles.cardLabel}>PROXe</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Voice</h3>
            <p className={styles.cardLabel}>PROXe</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Content</h3>
            <p className={styles.cardLabel}>PROXe</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Founder</h3>
            <p className={styles.cardLabel}>PROXe</p>
          </div>
        </div>
      </section>
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}

