'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/src/hooks/useChat';
import { InfinityLoader } from './InfinityLoader';
import type { BrandConfig } from '@/src/configs';
import styles from './ChatWidget.module.css';

interface ChatWidgetProps {
  brand: string;
  config: BrandConfig;
  apiUrl?: string;
}

// PROXE Logo component (white icon version)
const PROXELogo = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 643 643" style={{ width: '100%', height: '100%' }}>
    <path d="M0 0 C2.55518105 -0.00322395 5.11036192 -0.00658882 7.6655426 -0.01008606 C12.99993388 -0.01603919 18.33430821 -0.01797345 23.66870117 -0.01733398 C29.7556638 -0.01673585 35.84253706 -0.02725095 41.92947716 -0.04307765 C47.87319933 -0.05795756 53.81689546 -0.0613159 59.76063728 -0.06072426 C62.24751207 -0.06188581 64.73438789 -0.06620156 67.22125053 -0.07405663 C89.27651721 -0.13719172 111.50963207 0.39970382 133.25390625 4.41796875 C134.45168701 4.63267822 135.64946777 4.8473877 136.88354492 5.06860352 C147.60885456 7.06782473 158.02060533 9.75624396 168.37890625 13.16796875 C169.07161621 13.39033203 169.76432617 13.61269531 170.47802734 13.84179688 C191.49998952 20.69734064 211.08444408 32.02655021 227.1953125 47.16015625 C229.37705947 49.22309608 229.37705947 49.22309608 231.88671875 51.109375 C236.4059078 54.84231015 239.77832631 59.57161291 243.37890625 64.16796875 C244.02988281 64.96847656 244.68085937 65.76898438 245.3515625 66.59375 C261.74568838 87.70076627 270.32398638 114.04301497 274.37890625 140.16796875 C274.49459961 140.85906738 274.61029297 141.55016602 274.72949219 142.26220703 C282.29318243 189.02466583 276.19902808 244.9042784 249.0546875 284.67578125 C242.86549658 293.12246066 235.81558031 300.81162913 228.37890625 308.16796875 C227.6209375 308.92335938 226.86296875 309.67875 226.08203125 310.45703125 C183.60584066 350.90410446 121.23455315 356.3199838 65.62890625 356.3359375 C63.63650026 356.33834297 61.64409426 356.34075098 59.65168858 356.34339792 C53.40043889 356.35147619 47.14920354 356.35398837 40.89794922 356.35327148 C34.53035799 356.35267292 28.16285207 356.363196 21.79528236 356.37901515 C16.25824922 356.3922615 10.72124335 356.39744833 5.18419456 356.39681607 C1.90836564 356.39656594 -1.36737224 356.40012154 -4.64318848 356.40999413 C-26.38672218 356.46938784 -48.32070333 356.0589274 -69.74609375 351.98046875 C-71.47291382 351.65900879 -71.47291382 351.65900879 -73.23461914 351.33105469 C-105.21391229 345.11926535 -134.61598121 333.2708796 -159.62109375 312.16796875 C-160.48605469 311.44480469 -161.35101563 310.72164063 -162.2421875 309.9765625 C-167.1711856 305.72914592 -171.55937074 301.24923357 -175.62109375 296.16796875 C-176.44351563 295.14445312 -177.2659375 294.1209375 -178.11328125 293.06640625 C-203.72182995 260.22737116 -212.112449 219.37733841 -211.93359375 178.54296875 C-211.93177094 177.67255951 -211.92994812 176.80215027 -211.92807007 175.90536499 C-211.79053856 136.73576322 -204.02988251 95.33486431 -178.62109375 64.16796875 C-178.19634766 63.63397461 -177.77160156 63.09998047 -177.33398438 62.54980469 C-147.98305281 25.80939317 -103.87677367 9.67884258 -58.62109375 2.98046875 C-57.50653809 2.81329346 -56.39198242 2.64611816 -55.24365234 2.47387695 C-36.90877248 -0.10235019 -18.47621475 0.00554858 0 0 Z M-100.62109375 91.16796875 C-101.4615625 91.91691406 -102.30203125 92.66585937 -103.16796875 93.4375 C-117.16855627 106.56835405 -124.00505891 123.93954179 -128.62109375 142.16796875 C-128.62109375 143.15796875 -128.62109375 144.14796875 -128.62109375 145.16796875 C-22.36109375 145.16796875 83.89890625 145.16796875 193.37890625 145.16796875 C188.17784025 120.8963274 178.51473758 98.48989587 157.00390625 84.41796875 C155.14428381 83.30844612 153.26890815 82.22491196 151.37890625 81.16796875 C150.44304687 80.64460938 149.5071875 80.12125 148.54296875 79.58203125 C115.02122643 61.87751855 75.19191438 63.8227628 38.39355469 63.90722656 C33.38502202 63.91862023 28.37670188 63.91184575 23.36817646 63.90034962 C-42.92876378 62.5392535 -42.92876378 62.5392535 -100.62109375 91.16796875 Z M-128.62109375 210.16796875 C-125.15512694 229.23078619 -118.87165345 245.7767931 -105.62109375 260.16796875 C-105.08226562 260.79832031 -104.5434375 261.42867188 -103.98828125 262.078125 C-85.80274544 282.13704515 -54.52949136 289.03297211 -28.62109375 291.16796875 C-24.65424345 291.3166575 -20.69031115 291.33505996 -16.72094727 291.3449707 C-15.56170746 291.3515419 -14.40246765 291.3581131 -13.20809937 291.36488342 C-9.38873207 291.38451451 -5.56940411 291.39626245 -1.75 291.40625 C-0.43370039 291.41032553 0.88259922 291.41440105 2.2387867 291.41860008 C8.50187462 291.43762766 14.76495108 291.45185362 21.02806228 291.46021205 C28.1796475 291.46992108 35.33091798 291.49608268 42.48239273 291.53671294 C48.05745887 291.56726177 53.63243696 291.58171756 59.20758492 291.58499306 C62.51390939 291.58730356 65.81963419 291.59782163 69.12591362 291.62145424 C103.19356045 291.84963689 140.10551561 288.14765068 166.37890625 264.16796875 C167.10851562 263.51957031 167.838125 262.87117188 168.58984375 262.203125 C173.95691046 257.17535561 177.75339023 251.53934043 181.37890625 245.16796875 C181.97832031 244.11738281 182.57773437 243.06679688 183.1953125 241.984375 C188.18472261 232.66290687 193.37890625 220.92132356 193.37890625 210.16796875 C87.11890625 210.16796875 -19.14109375 210.16796875 -128.62109375 210.16796875 Z " fill="#FFFFFF" transform="translate(281.62109375,128.83203125)"/>
  </svg>
);

// Infinity symbol component (white)
const InfinitySymbol = () => (
  <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 32 32" viewBox="0 0 32 32" style={{ width: '100%', height: '100%' }}>
    <path d="M27.89453,10.09025c-2.22363-1.14404-4.86914-0.95166-6.9043,0.50146L16,14.15666l-4.99023-3.56494c-2.03516-1.45313-4.68262-1.64551-6.9043-0.50146C1.88184,11.23478,0.5,13.49894,0.5,15.99992s1.38184,4.76514,3.60547,5.90967c2.22461,1.14355,4.86914,0.95215,6.9043-0.50146L16,17.84318l4.99023,3.56494c1.15332,0.82373,2.50195,1.24219,3.85938,1.24219c1.03809,0,2.08203-0.24512,3.04492-0.74072C30.11816,20.76506,31.5,18.5009,31.5,15.99992S30.11816,11.23478,27.89453,10.09025z M9.26563,18.96672c-1.13281,0.80957-2.54688,0.91357-3.78809,0.27539C4.23926,18.60441,3.5,17.3925,3.5,15.99992s0.73926-2.60449,1.97754-3.24219c0.53906-0.27686,1.11133-0.41406,1.67871-0.41406c0.73828,0,1.46875,0.23193,2.10938,0.68945l4.15332,2.9668L9.26563,18.96672z M26.52246,19.24211c-1.24023,0.63818-2.6543,0.53418-3.78809-0.27539l-4.15332-2.9668l4.15332-2.9668c1.13379-0.80957,2.54785-0.91162,3.78809-0.27539C27.76074,13.39543,28.5,14.60734,28.5,15.99992S27.76074,18.60441,26.52246,19.24211z" fill="#ffffff"/>
  </svg>
);

// Wind Chasers Icon component - uses the SVG file
const WindChasersIcon = () => (
  <img src="/assets/icons/WC-Icon.svg" alt="Wind Chasers" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
);

const ICONS = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
  ),
  reset: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M3 21v-5h5"></path>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="4"/>
      <path d="M12 14c-6 0-8 3-8 3v7h16v-7s-2-3-8-3z"/>
    </svg>
  ),
  ai: (brand: string, config?: BrandConfig) => {
    // Use brand config avatar if available
    if (config?.chatStructure?.avatar) {
      const avatarType = config.chatStructure.avatar.type;
      if (avatarType === 'logo' && brand === 'proxe') {
        return <PROXELogo />;
      }
      if (avatarType === 'icon' && brand === 'windchasers') {
        return <WindChasersIcon />;
      }
      if (avatarType === 'image' && config.chatStructure.avatar.source) {
        return <img src={config.chatStructure.avatar.source} alt={config.name} style={{ width: '100%', height: '100%' }} />;
      }
    }
    // Fallback: Use PROXE logo for PROXe brand, Wind Chasers icon for windchasers, infinity symbol for others
    if (brand === 'proxe') {
      return <PROXELogo />;
    }
    if (brand === 'windchasers') {
      return <WindChasersIcon />;
    }
    return <InfinitySymbol />;
  },
  infinity: <InfinitySymbol />,
};

export function ChatWidget({ brand, config, apiUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showQuickButtons, setShowQuickButtons] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickButtonsRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartScrollLeft = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  const { messages, isLoading, sendMessage, handleQuickButton, clearMessages } = useChat({
    brand,
    apiUrl,
  });

  useEffect(() => {
    // Scroll to bottom whenever messages update (including streaming)
    if (isOpen && messagesEndRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
    
    // Add/remove class to body for background blur
    if (isOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
    
    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [messages, isOpen]);

  // Listen for streaming updates to auto-scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleMessageUpdate = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('message-updated', handleMessageUpdate);
    return () => {
      window.removeEventListener('message-updated', handleMessageUpdate);
    };
  }, [isOpen]);

  // Enable horizontal scrolling with mouse wheel and drag on desktop
  useEffect(() => {
    const quickButtonsElement = quickButtonsRef.current;
    if (!quickButtonsElement) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle wheel events if the element is scrollable horizontally
      if (quickButtonsElement.scrollWidth > quickButtonsElement.clientWidth) {
        // Check if scrolling horizontally (shift + wheel) or convert vertical to horizontal
        const isHorizontalScroll = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
        
        if (isHorizontalScroll || Math.abs(e.deltaX) > 0) {
          // Horizontal scroll - allow default behavior
          return;
        }
        
        // Convert vertical scroll to horizontal
        e.preventDefault();
        quickButtonsElement.scrollBy({
          left: e.deltaY,
          behavior: 'auto'
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (quickButtonsElement.scrollWidth > quickButtonsElement.clientWidth) {
        setIsDragging(true);
        hasDraggedRef.current = false;
        dragStartX.current = e.pageX - quickButtonsElement.offsetLeft;
        dragStartScrollLeft.current = quickButtonsElement.scrollLeft;
        quickButtonsElement.style.cursor = 'grabbing';
        quickButtonsElement.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        // Don't prevent default yet - wait to see if user drags
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const x = e.pageX - quickButtonsElement.offsetLeft;
      const deltaX = Math.abs(x - dragStartX.current);
      
      // Only prevent default and scroll if user has moved more than 5px (to distinguish from clicks)
      if (deltaX > 5) {
        hasDraggedRef.current = true;
        e.preventDefault();
        const walk = (x - dragStartX.current) * 2; // Scroll speed multiplier
        quickButtonsElement.scrollLeft = dragStartScrollLeft.current - walk;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        quickButtonsElement.style.cursor = '';
        quickButtonsElement.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // If user dragged, prevent click event on buttons
        if (hasDraggedRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
        hasDraggedRef.current = false;
      }
    };

    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        quickButtonsElement.style.cursor = '';
        quickButtonsElement.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    // Only enable drag on desktop (not touch devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    quickButtonsElement.addEventListener('wheel', handleWheel, { passive: false });
    
    if (!isTouchDevice) {
      quickButtonsElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      quickButtonsElement.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      quickButtonsElement.removeEventListener('wheel', handleWheel);
      if (!isTouchDevice) {
        quickButtonsElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        quickButtonsElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isExpanded, showQuickButtons, isDragging]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    setMessageCount((prev) => prev + 1);
    
    if (!isOpen) {
      setIsOpen(true);
      setIsExpanded(false);
      setShowQuickButtons(false);
      setTimeout(() => sendMessage(message, messageCount + 1), 100);
    } else {
      sendMessage(message, messageCount + 1);
    }
  };

  const handleQuickButtonClick = (buttonText: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(true);
    setIsExpanded(false);
    setShowQuickButtons(false);
    setMessageCount((prev) => prev + 1);
    setTimeout(() => handleQuickButton(buttonText, messageCount + 1), 300);
  };

  const handleInputFocus = () => {
    if (!isOpen) {
      setIsExpanded(true);
      // Show quick buttons only when expanded
      setShowQuickButtons(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't hide if clicking on a quick button
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest(`.${styles.quickBtn}`)) {
      return;
    }
    
    setTimeout(() => {
      if (!inputValue.trim() && !isOpen) {
        setShowQuickButtons(false);
        setIsExpanded(false);
      }
    }, 200);
  };

  const formatText = (text: string): string => {
    if (!text) return '';
    // Basic markdown to HTML conversion
    // Only convert actual newlines (double newlines) to breaks, not single spaces
    // Let text wrap naturally at container boundaries
    return text
      .replace(/\n\n+/g, '<br><br>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  };

  if (!isOpen) {
    return (
      <div className={styles.searchbarWrapper}>
        {isExpanded && showQuickButtons && config?.quickButtons && config.quickButtons.length > 0 && (
          <div ref={quickButtonsRef} className={styles.quickButtons}>
            {config.quickButtons.map((buttonText, index) => (
              <button
                key={index}
                className={styles.quickBtn}
                onClick={(e) => {
                  // Only handle click if we didn't drag
                  if (!hasDraggedRef.current) {
                    handleQuickButtonClick(buttonText, e);
                  }
                }}
              >
                {buttonText}
              </button>
            ))}
          </div>
        )}
        <div 
          className={`${styles.searchbar} ${isExpanded ? styles.searchbarExpanded : ''}`}
          onClick={(e) => {
            if (!isOpen && !isExpanded) {
              e.stopPropagation();
              setIsExpanded(true);
              setTimeout(() => {
                setShowQuickButtons(true);
                inputRef.current?.focus();
              }, 100);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.searchIcon}>
            {ICONS.search}
          </div>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (!isOpen) {
                setIsExpanded(true);
                setTimeout(() => {
                  setShowQuickButtons(true);
                }, 100);
              }
            }}
            onBlur={handleInputBlur}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                handleSend();
              }
            }}
          />
          {inputValue.trim() && (
            <button 
              className={styles.sendBtn} 
              onClick={(e) => {
                e.stopPropagation();
                handleSend();
              }}
            >
              {ICONS.send}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatboxContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.brandName}>
          <div className={styles.avatar}>
            {brand === 'proxe' ? <PROXELogo /> : ICONS.ai(brand, config)}
          </div>
          <span>{config.name}</span>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.resetBtn} 
            onClick={() => {
              setIsOpen(false);
              clearMessages();
            }}
            title="Reset chat"
          >
            {ICONS.reset}
          </button>
          <button className={styles.closeBtn} onClick={() => {
            setIsOpen(false);
            clearMessages();
          }}>
            {ICONS.close}
          </button>
        </div>
      </div>
      <div className={styles.messagesArea}>
        {messages.map((message, index) => {
          // Rotate through accent colors (0-6 for 7 colors)
          const accentIndex = index % 7;
          const accentClass = `accent-${accentIndex}`;
          
          return (
          <div key={message.id} className={`${styles.message} ${styles[message.type]} ${styles[accentClass]}`}>
            <div className={styles.messageContent}>
              <div className={styles.bubble}>
                {message.isStreaming && !message.text ? (
                  <InfinityLoader />
                ) : (
                  <div className={styles.bubbleContent}>
                    {/* Header with avatar and name inside the bubble */}
                    <div className={styles.bubbleHeader}>
                      <div className={styles.bubbleAvatar}>
                        {message.type === 'ai' ? ICONS.ai(brand, config) : ICONS.user}
                      </div>
                      <span className={styles.bubbleName}>
                        {message.type === 'ai' ? config.name : 'You'}
                      </span>
                    </div>
                    
                    {/* Message content */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'nowrap', gap: '8px', width: '100%' }}>
                      {message.isStreaming && (
                        <div className={styles.infinityLoaderWrapper}>
                          <InfinityLoader />
                        </div>
                      )}
                      <div
                        className={styles.messageText}
                        style={{ flex: '1 1 auto', minWidth: 0 }}
                        dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
                      />
                      {message.isStreaming && message.text && (
                        <span className={styles.streamingCursor}>▋</span>
                      )}
                    </div>
                    
                    {/* Follow-up buttons inside the bubble for AI messages */}
                    {message.type === 'ai' && message.followUps && message.followUps.length > 0 && !message.isStreaming && message.hasStreamed === true && (
                      <div className={styles.followUpButtons}>
                        {message.followUps.map((followUp, followUpIndex) => {
                          // Rotate through accent colors for follow-up buttons
                          const buttonAccentIndex = (accentIndex + followUpIndex) % 7;
                          const buttonAccentClass = `accent-${buttonAccentIndex}`;
                          
                          return (
                          <button
                            key={followUpIndex}
                            className={`${styles.followUpBtn} ${styles[buttonAccentClass]}`}
                            onClick={() => {
                              setMessageCount((prev) => prev + 1);
                              sendMessage(followUp, messageCount + 1);
                            }}
                          >
                            {followUp}
                          </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <div className={styles.chatInputWrapper}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                handleSend();
              }
            }}
          />
        </div>
        <button className={styles.sendBtn} onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
          {ICONS.send}
        </button>
      </div>
    </div>
  );
}

