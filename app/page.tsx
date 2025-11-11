'use client'

import { useEffect, useState } from 'react';

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';
import Header from '@/src/components/shared/Header';
import BlurText from '@/src/components/shared/BlurText';
import { useDeployModal } from '@/src/contexts/DeployModalContext';
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
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeSolution, setActiveSolution] = useState<string | null>(null);
  const { openModal } = useDeployModal();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const applyMatches = (matches: boolean) => {
      setIsMobile(matches);
    };

    applyMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyMatches(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  const proxeSolutions = [
    {
      id: 'web',
      title: 'Website PROXe',
      icon: BrowserIcon,
      tagline: 'AI sales agent that lives on your site 24/7',
      benefits: [
        'Instant lead capture & qualification',
        'Auto-books demos while you sleep',
        'Hands hot buyers to your reps ready-to-close',
      ],
      ctaLabel: 'Learn more',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp PROXe',
      icon: WhatsappIcon,
      tagline: 'AI that runs your WhatsApp like a top SDR',
      benefits: [
        'Replies in < 3 s, any hour',
        'Qualifies with auto-custom questions',
        'Pushes booked calls straight to calendar',
      ],
      ctaLabel: 'Learn more',
    },
    {
      id: 'voice',
      title: 'Voice PROXe',
      icon: AiVoiceIcon,
      tagline: 'AI phone rep who never puts anyone on hold',
      benefits: [
        'Answers, qualifies & schedules every call',
        'Speaks 28 languages, local accent',
        'Instantly syncs notes to CRM / WhatsApp',
      ],
      ctaLabel: 'Learn more',
    },
    {
      id: 'social',
      title: 'Social PROXe',
      icon: VideoAiIcon,
      tagline: 'AI social that claps back at every comment and inbox in seconds',
      benefits: [
        'Answers questions, qualifies leads, books calls in-chat',
        'Keeps brand voice consistent at global scale',
        'Turns social chatter into pipeline without lifting a finger',
      ],
      ctaLabel: 'Learn more',
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
        <h2 className={styles.sectionHeading}>Meet Our PROXes</h2>
        <p className={styles.sectionSubtitle}>
          Deploy the channel-first agent that matches the way your customers already interact.
        </p>
        <div className={styles.solutionsGrid}>
          {proxeSolutions.map((solution) => (
            <article
              key={solution.id}
              className={[
                styles.solutionCard,
                activeSolution === solution.id
                  ? styles.solutionCardExpanded
                  : styles.solutionCardCollapsed,
              ]
                .filter(Boolean)
                .join(' ')}
              role="button"
              tabIndex={0}
              aria-expanded={activeSolution === solution.id}
              onClick={() => {
                setActiveSolution((current) =>
                  current === solution.id ? null : solution.id
                );
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveSolution((current) =>
                    current === solution.id ? null : solution.id
                  );
                }
              }}
            >
              <div className={styles.solutionHeader}>
                <div className={styles.solutionIcon} aria-hidden="true">
                  <HugeiconsIcon icon={solution.icon} size={39} />
                </div>
                <div className={styles.solutionHeadingGroup}>
                  <h3 className={styles.solutionTitle}>{solution.title}</h3>
                </div>
                <span className={styles.solutionToggleIcon} aria-hidden="true">
                  {activeSolution === solution.id ? '−' : '+'}
                </span>
              </div>
              <p className={styles.solutionTagline}>{solution.tagline}</p>
              <div className={styles.solutionExpandable}>
                <ul className={styles.solutionBenefitList}>
                  {solution.benefits.map((benefit) => (
                    <li key={benefit} className={styles.solutionBenefitItem}>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <button 
                  className={styles.solutionCta} 
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal();
                  }}
                >
                  {solution.ctaLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}
