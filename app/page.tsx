'use client'

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

import { BrandChatWidget } from '@/src/components/brand/BrandChatWidget';
import DarkVeil from '@/src/components/shared/DarkVeil';
import Header from '@/src/components/shared/Header';
import BlurText from '@/src/components/shared/BlurText';
import FadeInSection from '@/src/components/shared/FadeInSection';
import FadeInElement from '@/src/components/shared/FadeInElement';
import FeaturedSectionStats from '@/src/components/ui/FeaturedSectionStats';
import { useDeployModal } from '@/src/contexts/DeployModalContext';
import styles from './page.module.css';
import {
  HugeiconsIcon,
  BrowserIcon,
  WhatsappIcon,
  VideoAiIcon,
  CallIcon,
  EmailIcon,
  SmsIcon,
} from '@/src/components/shared/icons/HugeIcons';

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || undefined;
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeSolution, setActiveSolution] = useState<string | null>(null);
  const { openModal } = useDeployModal();
  const [rotatingWord, setRotatingWord] = useState(0);
  const rotatingWords = ['Owned', 'Handled', 'Captured', 'Secured'];
  const [mounted, setMounted] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const chatWidgetRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const reveal = () => {
      // slight delay to avoid showing during loader
      setTimeout(() => setShowWidget(true), 300);
    };

    if (document.readyState === 'complete') {
      reveal();
    } else {
      window.addEventListener('load', reveal, { once: true });
    }

    return () => window.removeEventListener('load', reveal);
  }, []);

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

  // Rotate words effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Force chat widget to float above all content at bottom-right via portal
  useEffect(() => {
    const forceFloating = () => {
      const container = chatWidgetRef.current;
      if (!container) return;

      const searchbarWrapper = container.querySelector('.searchbarWrapper') as HTMLElement;
      if (searchbarWrapper) {
        searchbarWrapper.style.setProperty('position', 'fixed', 'important');
        searchbarWrapper.style.setProperty('bottom', '20px', 'important');
        searchbarWrapper.style.setProperty('right', '20px', 'important');
        searchbarWrapper.style.setProperty('left', 'auto', 'important');
        searchbarWrapper.style.setProperty('top', 'auto', 'important');
        searchbarWrapper.style.setProperty('transform', 'none', 'important');
        searchbarWrapper.style.setProperty('z-index', '2147483647', 'important');
      }
    };

    forceFloating();
    const interval = setInterval(forceFloating, 100);

    return () => clearInterval(interval);
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
      icon: CallIcon,
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
      tagline: 'Social AI for No missed commets and DMs',
      benefits: [
        'Answers questions, qualifies leads, books calls in-chat',
        'Keeps brand voice consistent at global scale',
        'Turns social chatter into pipeline without lifting a finger',
      ],
      ctaLabel: 'Learn more',
    },
  ];

  return (
    <>
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
          <linearGradient id="whatsappIconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="voiceIconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="emailIconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="smsIconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e40af" />
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
      <section ref={heroSectionRef} className={styles.heroSection}>
        <div className={styles.heroTitle}>
          <BlurText
            text="Every Conversation"
            delay={150}
            animateBy="words"
            direction="top"
          />
          <div className={styles.heroTitleLine}>
            <BlurText
              text="Every Opportunity"
              delay={150}
              animateBy="words"
              direction="top"
            />
            <span key={rotatingWord} className={styles.rotatingWord}>
              {rotatingWords[rotatingWord]}
            </span>
          </div>
        </div>
        <p className={styles.heroSubtitle}>PROXe turns every potential customer into revenue. Listens across every channel. Never forgets. Always improving.</p>
          <div className={styles.channelIcons}>
            <div className={styles.channelIconItem}>
              <HugeiconsIcon icon={BrowserIcon} size={36} stroke="url(#webIconGradient)" />
            <span className={styles.channelLabel}>Website</span>
          </div>
          <div className={styles.channelIconItem}>
              <HugeiconsIcon icon={WhatsappIcon} size={36} stroke="url(#whatsappIconGradient)" />
            <span className={styles.channelLabel}>WhatsApp</span>
          </div>
          <div className={styles.channelIconItem}>
              <HugeiconsIcon icon={CallIcon} size={36} stroke="url(#voiceIconGradient)" />
            <span className={styles.channelLabel}>Voice</span>
          </div>
          <div className={styles.channelIconItem}>
              <HugeiconsIcon icon={EmailIcon} size={36} stroke="url(#emailIconGradient)" />
            <span className={styles.channelLabel}>Email</span>
          </div>
          <div className={styles.channelIconItem}>
              <HugeiconsIcon icon={SmsIcon} size={36} stroke="url(#smsIconGradient)" />
            <span className={styles.channelLabel}>SMS</span>
          </div>
        </div>
      </section>
      <FadeInSection className={styles.whyProxeSection} delay={100}>
        <div className={styles.headingSubtextColumns}>
          <div>
            <FadeInElement>
              <p className={styles.eyebrow}>PROXe</p>
            </FadeInElement>
            <FadeInElement delay={50}>
              <h2 className={styles.sectionHeading}>The complete AI system that turns conversations into opportunities</h2>
            </FadeInElement>
          </div>
          <FadeInElement delay={100}>
            <p className={styles.sectionSubtitle}>
              Built for businesses that can't afford to lose leads. PROXe Captures everything. Remembers everything. Closes everything.
            </p>
          </FadeInElement>
        </div>
        <div className={styles.featureCardsGrid}>
          <FadeInElement delay={150}>
            <article className={styles.featureCard}>
              <p className={styles.featureEyebrow}>Capture</p>
              <h3 className={styles.featureTitle}>Never Miss Another Lead Ever</h3>
              <p className={styles.featureDescription}>
                Every message captured. WhatsApp, website, Instagram, SMS, email. 24/7 listening. No inquiry lost.
              </p>
            </article>
          </FadeInElement>
          <FadeInElement delay={200}>
            <article className={styles.featureCard}>
              <p className={styles.featureEyebrow}>Remember</p>
              <h3 className={styles.featureTitle}>One Memory Across Channels</h3>
              <p className={styles.featureDescription}>
                Full conversation history. WhatsApp, website, Instagram, SMS, email. Same thread. Customers never repeat themselves.
              </p>
            </article>
          </FadeInElement>
          <FadeInElement delay={250}>
            <article className={styles.featureCard}>
              <p className={styles.featureEyebrow}>Close</p>
              <h3 className={styles.featureTitle}>Complete Customer Journey</h3>
              <p className={styles.featureDescription}>
                Automated follow-ups. Smart nudges. Cross-channel reactivation. First touch to final close—fully handled.
              </p>
            </article>
          </FadeInElement>
        </div>
      </FadeInSection>
      <FadeInSection className={styles.thirdSection} delay={200}>
        <FadeInElement>
          <h2 className={styles.sectionHeading}>Powerful Features</h2>
        </FadeInElement>
        <FadeInElement delay={50}>
          <p className={styles.sectionSubtitle}>
            Built to deliver intelligence that adapts and evolves with your business
          </p>
        </FadeInElement>
        <div className={styles.bentoGrid}>
          <FadeInElement delay={100}>
            <article className={styles.bentoCard}>
            <div className={styles.bentoCardImage}>
              <Image
                src="/assets/proxe/Self learning.webp"
                alt="Self-Learning Core"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className={styles.bentoCardHeadline}>Self-Learning Core</h3>
            <p className={styles.bentoCardSubtext}>
              Every click, reply, and call feeds the same brain, so your AI understands customers better each second.
            </p>
            </article>
          </FadeInElement>
          <FadeInElement delay={150}>
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
              PROXe runs on the newest, strongest AI model, so your Business systems are run by the best AI available always
            </p>
          </article>
          </FadeInElement>
          <FadeInElement delay={200} animationType="fadeUp">
            <article className={styles.bentoCard}>
            <div className={styles.bentoCardImage}>
              <Image
                src="/assets/proxe/one memmory one vioce.webp"
                alt="One Memory, One Voice"
                width={400}
                height={200}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <h3 className={styles.bentoCardHeadline}>One Memory, One Voice</h3>
            <p className={styles.bentoCardSubtext}>
              All channels website, WhatsApp, voice, social share customer history and brand tone, so conversations never reset.
            </p>
          </article>
          </FadeInElement>
          <FadeInElement delay={250}>
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
          </FadeInElement>
        </div>
       </FadeInSection>
      <FeaturedSectionStats />
    </main>
    {mounted && showWidget && typeof window !== 'undefined' && createPortal(
      <div 
        ref={chatWidgetRef}
        className={`${styles.chatWidgetContainer} ${styles.chatWidgetScrolled} ${showWidget ? styles.widgetVisible : ''}`}
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 2147483647, pointerEvents: 'auto' }}
      >
        <BrandChatWidget brand="proxe" apiUrl={apiUrl} />
      </div>,
      document.body
    )}
     </>
   )
 }
