'use client';

import { useEffect, useState } from 'react';

interface SimpleRotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

export default function SimpleRotatingText({ 
  texts, 
  interval = 2000,
  className = '' 
}: SimpleRotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return <span className={className}>{texts[currentIndex]}</span>;
}

