export interface BrandConfig {
  name: string;
  brand: string;
  apiUrl?: string;
  supabase?: {
    url?: string;
    anonKey?: string;
  };
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryVibrant: string;
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
    darkBg: string;
    darkCard: string;
    darkSurface: string;
    glassBg: string;
    glassBorder: string;
    glassShadow: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    white: string;
    textButton?: string;
    borderLight: string;
    borderMedium: string;
    borderAccent: string;
    borderGlow: string;
    borderColor: string;
    greenSuccess: string;
    tealAccent?: string;
    cyanAccent?: string;
    pinkAccent?: string;
    goldAccent?: string;
    orangeAccent?: string;
    burgundyAccent?: string;
    bgPrimary: string;
    bgHeader: string;
    bgMessageArea: string;
    bgHover: string;
    bgActive: string;
    bubbleUserBg: string;
    bubbleUserBorder: string;
    bubbleUserShadow: string;
    bubbleAiBg: string;
    bubbleAiBorder: string;
    bubbleAiShadow: string;
    buttonBg: string;
    buttonHover: string;
    buttonActive: string;
  };
  quickButtons: string[];
  followUpButtons: string[];
}

export const proxeConfig: BrandConfig = {
  name: 'PROXe',
  brand: 'proxe',
  colors: {
    primary: '#E8A153',
    primaryLight: '#FDFEFD',
    primaryDark: '#994013',
    primaryVibrant: '#38A5DD',
    gradientStart: '#994013',
    gradientMid: '#E8A153',
    gradientEnd: '#38A5DD',
    darkBg: '#0A0A0A',
    darkCard: 'rgba(68, 28, 13, 0.3)',
    darkSurface: 'rgba(22, 14, 17, 0.4)',
    glassBg: 'rgba(232, 161, 83, 0.05)',
    glassBorder: 'rgba(253, 254, 253, 0.1)',
    glassShadow: 'rgba(153, 64, 19, 0.2)',
    textPrimary: '#FDFEFD',
    textSecondary: 'rgba(253, 254, 253, 0.7)',
    textTertiary: 'rgba(253, 254, 253, 0.5)',
    textMuted: 'rgba(253, 254, 253, 0.4)',
    white: '#FDFEFD',
    borderLight: 'rgba(253, 254, 253, 0.08)',
    borderMedium: 'rgba(253, 254, 253, 0.12)',
    borderAccent: 'rgba(232, 161, 83, 0.3)',
    borderGlow: 'rgba(232, 161, 83, 0.4)',
    borderColor: 'rgba(232, 161, 83, 0.2)',
    greenSuccess: '#10B981',
    cyanAccent: '#38A5DD',
    orangeAccent: '#E8A153',
    goldAccent: '#E8A153',
    bgPrimary: 'rgba(11, 67, 134, 0.05)',
    bgHeader: 'rgba(12, 29, 57, 0.85)',
    bgMessageArea: 'rgba(22, 14, 17, 0.03)',
    bgHover: 'rgba(232, 161, 83, 0.12)',
    bgActive: 'rgba(232, 161, 83, 0.15)',
    bubbleUserBg: 'rgba(232, 161, 83, 0.08)',
    bubbleUserBorder: 'rgba(253, 254, 253, 0.25)',
    bubbleUserShadow: '0 8px 32px rgba(232, 161, 83, 0.15)',
    bubbleAiBg: 'rgba(11, 67, 134, 0.05)',
    bubbleAiBorder: 'rgba(253, 254, 253, 0.1)',
    bubbleAiShadow: '0 8px 32px rgba(56, 165, 221, 0.1)',
    buttonBg: 'rgba(232, 161, 83, 0.12)',
    buttonHover: 'rgba(232, 161, 83, 0.2)',
    buttonActive: 'rgba(232, 161, 83, 0.3)',
  },
  quickButtons: ['What is PROXe', 'PROXe Demo', 'Deploy PROXe', 'Book a Call'],
  followUpButtons: ['Deploy PROXe', 'PROXe Pricing', 'Book a Call'],
};

