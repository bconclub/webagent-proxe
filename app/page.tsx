'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';

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
      // On mobile, set first card (web) as open by default
      if (matches) {
        setActiveSolution('web');
      } else {
        // On desktop, clear active solution
        setActiveSolution(null);
      }
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

  // Close card when clicking outside on desktop
  useEffect(() => {
    if (!isMobile && activeSolution) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-solution-id]')) {
          setActiveSolution(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobile, activeSolution]);
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
      tagline: 'Social AI thats digs deep in to your DMs and comments',
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
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="webIconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="webIconGradientHover" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
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
              data-solution-id={solution.id}
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
                  <h3 className={styles.solutionTitle}>
                    <span className={styles.titleFirstPart}>
                      {solution.title.replace(' PROXe', '')}
                    </span>
                    <span className={styles.titleSecondPart}>PROXe</span>
                  </h3>
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
      <section className={styles.thirdSection}>
        <h2 className={styles.sectionHeading}>Powerful Features</h2>
        <p className={styles.sectionSubtitle}>
          Built to deliver intelligence that adapts and evolves with your business
        </p>
        <div className={styles.bentoGrid}>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardImage}>
              {/* Image placeholder - replace with actual image path when available */}
              {/* <Image
                src="/assets/features/self-learning-core.jpg"
                alt="Self-Learning Core"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
              /> */}
            </div>
            <h3 className={styles.bentoCardHeadline}>Self-Learning Core</h3>
            <p className={styles.bentoCardSubtext}>
              Every click, reply, and call feeds the same brain, so your AI understands customers better each second - no manual retraining required.
            </p>
          </article>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardImage}>
              <Image
                src="/assets/proxe/Models.webp"
                alt="Latest Model, Instantly"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className={styles.bentoCardHeadline}>Latest Model, Instantly</h3>
            <p className={styles.bentoCardSubtext}>
              The moment a stronger fine-tuned model releases, PROXe swaps to it automatically, your competitors still wait for dev queues.
            </p>
          </article>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardImage}>
              {/* Image placeholder - replace with actual image path when available */}
              {/* <Image
                src="/assets/features/one-memory-one-voice.jpg"
                alt="One Memory, One Voice"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
              /> */}
            </div>
            <h3 className={styles.bentoCardHeadline}>One Memory, One Voice</h3>
            <p className={styles.bentoCardSubtext}>
              Website, WhatsApp, voice, and social share the same customer history and brand tone, making every touchpoint feel like the same conversation.
            </p>
          </article>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardImage}>
              <Image
                src="/assets/proxe/Command Center.webp"
                alt="Command Center Dashboard"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className={styles.bentoCardHeadline}>Command Center Dashboard</h3>
            <p className={styles.bentoCardSubtext}>
              One screen shows every conversation, lead, and metric. Jump in, take over, or let the AI finish the deal without losing context
            </p>
          </article>
        </div>
      </section>
      <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
    </main>
  )
}
