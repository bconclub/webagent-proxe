'use client'

import React from 'react';
import styles from './InfinityLoader.module.css';

export function InfinityLoader() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.dot}></div>
    </div>
  );
}

