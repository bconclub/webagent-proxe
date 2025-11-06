'use client'

import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <img src="/assets/proxe/PROXe-Logo.png" alt="PROXe Logo" className={styles.logo} />
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>PROXes</a>
          <a href="#" className={styles.navLink}>Pricing</a>
          <button className={styles.deployButton}>Deploy</button>
        </nav>
        <div className={styles.mobileNav}>
          <button 
            className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.plusIcon}>+</span>
          </button>
          <button className={styles.mobileDeployButton}>Deploy</button>
        </div>
      </div>
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>PROXes</a>
          <a href="#" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Pricing</a>
        </div>
      )}
    </header>
  );
}

