'use client'

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';
import Header from '@/src/components/shared/Header';
import BlurText from '@/src/components/shared/BlurText';
import styles from './page.module.css';
import {
  HugeiconsIcon,
  BrowserIcon,
  WhatsappIcon,
  AiVoiceIcon,
  VideoAiIcon,
} from '@/src/components/shared/icons/HugeIcons';

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;
  const proxeSolutions = [
    {
      id: 'web',
      title: 'Web\nPROXe',
      icon: BrowserIcon,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp\nPROXe',
      icon: WhatsappIcon,
    },
    {
      id: 'voice',
      title: 'Voice\nPROXe',
      icon: AiVoiceIcon,
    },
    {
      id: 'social',
      title: 'Social\nPROXe',
      icon: VideoAiIcon,
    },
  ];

  return (
    <main className={styles.pageContainer}>
      <div 
        id="darkveil-container"
        className="darkveil-container"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 0, 
          pointerEvents: 'none', 
          width: '100vw', 
          height: '100vh', 
          minWidth: '100vw', 
          minHeight: '100vh',
          backgroundColor: 'transparent'
        }}
      >
        <DarkVeil speed={0.8} warpAmount={0.3} />
      </div>
      <Header />
      <section className={styles.heroSection}>
        <BlurText
          text="Intelligence That Runs Your Business Better"
          delay={150}
          animateBy="words"
          direction="top"
          className={styles.heroTitle}
        />
        <p className={styles.heroSubtitle}>One AI Brain. Every channel. Zero blind spots.</p>
      </section>
      <section className={styles.solutionsSection}>
        <h2 className={styles.sectionHeading}>Choose Your PROXe</h2>
        <p className={styles.sectionSubtitle}>
          Deploy the channel-first agent that matches the way your customers already interact.
        </p>
        <div className={styles.solutionsGrid}>
          {proxeSolutions.map((solution) => (
            <article key={solution.id} className={styles.solutionCard}>
              <div className={styles.solutionIcon} aria-hidden="true">
                <HugeiconsIcon icon={solution.icon} size={39} />
              </div>
              <h3 className={styles.solutionTitle}>{solution.title}</h3>
            </article>
          ))}
        </div>
      </section>
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}
