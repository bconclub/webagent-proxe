'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ProxeHomepage.module.css';

export function ProxeHomepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.homepage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <Image 
              src="/assets/proxe/Proxe-Logo.png" 
              alt="PROXe Logo" 
              width={120} 
              height={40}
              className={styles.logoImage}
              priority
            />
          </Link>
          
          <nav className={styles.nav}>
            <Link href="/pricing" className={styles.navLink}>PROXe Pricing</Link>
          </nav>

          <Link href="/chat" className={styles.ctaButton}>
            Deploy PROXe
          </Link>

          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.menuIcon}></span>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuIcon}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/pricing" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>PROXe Pricing</Link>
            <Link href="/chat" className={styles.mobileCtaButton} onClick={() => setIsMenuOpen(false)}>Deploy PROXe</Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.featureTags}>
            <span className={styles.featureTag}>What's New</span>
            <span className={styles.featureTag}>Ease Update V0.1</span>
          </div>

          <h1 className={styles.heroTitle}>
            PROXe's that run your business better
          </h1>

          <p className={styles.heroSubtitle}>
            AI Agents for every business
          </p>

          <div className={styles.heroButtons}>
            <Link href="/chat" className={styles.primaryButton}>
              Deploy PROXe
            </Link>
          </div>
        </div>

        {/* Glowing Arc Visual */}
        <div className={styles.glowingArc}></div>
      </section>
    </div>
  );
}

