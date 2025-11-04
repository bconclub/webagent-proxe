import { BrandConfig } from './proxe.config';

export const windchasersConfig: BrandConfig = {
  name: 'Wind Chasers',
  brand: 'windchasers',
  systemPrompt: {
    path: '@/src/api/prompts/windchasers-prompt',
  },
  styles: {
    themePath: '@/src/styles/themes/windchasers.css',
  },
  chatStructure: {
    showQuickButtons: true,
    showFollowUpButtons: true,
    maxFollowUps: 3,
    avatar: {
      type: 'icon',
      source: '/assets/icons/WC-Icon.svg',
    },
  },
  colors: {
    // Primary colors - Gold/Sand
    primary: '#C4A574',
    primaryLight: '#D4B88A',
    primaryDark: '#B89664',
    primaryVibrant: '#C4A574',
    // Gradient colors
    gradientStart: '#2E2218',
    gradientMid: '#8B6B4A',
    gradientEnd: '#5A3828',
    // Dark backgrounds
    darkBg: '#000000',
    darkCard: 'rgba(90, 56, 40, 0.4)',
    darkSurface: 'rgba(46, 34, 24, 0.5)',
    // Glass effects
    glassBg: 'rgba(196, 165, 116, 0.08)',
    glassBorder: 'rgba(196, 165, 116, 0.15)',
    glassShadow: 'rgba(90, 56, 40, 0.4)',
    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#FFFFFF',
    textTertiary: 'rgba(196, 165, 116, 0.8)',
    textMuted: 'rgba(196, 165, 116, 0.6)',
    white: '#FFFFFF',
    textButton: '#000000',
    // Borders
    borderLight: 'rgba(196, 165, 116, 0.2)',
    borderMedium: 'rgba(196, 165, 116, 0.3)',
    borderAccent: 'rgba(196, 165, 116, 0.4)',
    borderGlow: 'rgba(196, 165, 116, 0.5)',
    borderColor: 'rgba(90, 56, 40, 0.5)',
    // Accents
    greenSuccess: '#10B981',
    goldAccent: '#C4A574',
    orangeAccent: '#8B6B4A',
    burgundyAccent: '#5A3828',
    // Backgrounds
    bgPrimary: 'rgba(90, 56, 40, 0.2)',
    bgHeader: 'rgba(46, 34, 24, 0.9)',
    bgMessageArea: 'rgba(46, 34, 24, 0.15)',
    bgHover: 'rgba(196, 165, 116, 0.15)',
    bgActive: 'rgba(196, 165, 116, 0.25)',
    // Chat bubbles
    bubbleUserBg: 'rgba(196, 165, 116, 0.15)',
    bubbleUserBorder: 'rgba(196, 165, 116, 0.3)',
    bubbleUserShadow: '0 8px 32px rgba(90, 56, 40, 0.4)',
    bubbleAiBg: 'rgba(46, 34, 24, 0.3)',
    bubbleAiBorder: 'rgba(139, 107, 74, 0.3)',
    bubbleAiShadow: '0 8px 32px rgba(90, 56, 40, 0.3)',
    // Buttons
    buttonBg: '#C4A574',
    buttonHover: '#D4B88A',
    buttonActive: '#B89664',
  },
  quickButtons: ['What is Wind Chasers', 'Programs', 'Book a Call'],
  followUpButtons: ['Programs', 'Admissions', 'Book a Call'],
};

