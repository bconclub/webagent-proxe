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
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.21-1.79 4-4 4s-4-1.79-4-4z" opacity="0.3"/>
      <path d="M16 12c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z" opacity="0.3"/>
      <path d="M12 8c-2.21 0-4 1.79-4 4" strokeWidth="2"/>
      <path d="M12 16c2.21 0 4-1.79 4-4" strokeWidth="2"/>
    </svg>
  ),
  infinity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
      <path d="M9 12c0-2 1.343-4 3-4s3 2 3 4-1.343 4-3 4-3-2-3-4z"/>
      <path d="M15 12c0 2 1.343 4 3 4s3-2 3-4-1.343-4-3-4-3 2-3 4z"/>
    </svg>
  ),
};

export function ChatWidget({ brand, config, apiUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showQuickButtons, setShowQuickButtons] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          <div className={styles.quickButtons}>
            {config.quickButtons.map((buttonText, index) => (
              <button
                key={index}
                className={styles.quickBtn}
                onClick={(e) => handleQuickButtonClick(buttonText, e)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
          <div className={styles.avatar}>{ICONS.user}</div>
          <span>{config.name}</span>
        </div>
        <button className={styles.closeBtn} onClick={() => {
          setIsOpen(false);
          clearMessages();
        }}>
          {ICONS.close}
        </button>
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
                        {message.type === 'ai' ? ICONS.infinity : ICONS.user}
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
        <button className={styles.sendBtn} onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
          {ICONS.send}
        </button>
      </div>
    </div>
  );
}

