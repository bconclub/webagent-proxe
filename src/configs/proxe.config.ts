export interface BrandConfig {
  name: string;
  brand: string;
  apiUrl?: string;
  supabase?: {
    url?: string;
    anonKey?: string;
  };
  // System prompt configuration
  systemPrompt?: {
    path?: string; // Path to system prompt file (e.g., '@/src/api/prompts/proxe-prompt')
    getPrompt?: (context: string, state?: string) => string; // Function to generate prompt
  };
  // CSS/styling configuration
  styles?: {
    themePath?: string; // Path to theme CSS file (e.g., '@/src/styles/themes/proxe.css')
    customStyles?: string; // Inline custom styles if needed
  };
  // Chat structure customization
  chatStructure?: {
    showQuickButtons?: boolean;
    showFollowUpButtons?: boolean;
    maxFollowUps?: number;
    avatar?: {
      type: 'logo' | 'icon' | 'image';
      source?: string; // Path to SVG or image
    };
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
  followUpButtons: string[]; // Default follow-up buttons
  firstMessageButtons?: string[]; // Buttons specifically for first message
}

export const proxeConfig: BrandConfig = {
  name: 'PROXe',
  brand: 'proxe',
  systemPrompt: {
    path: '@/src/api/prompts/proxe-prompt',
  },
  styles: {
    themePath: '@/src/styles/themes/proxe.css',
  },
  chatStructure: {
    showQuickButtons: true,
    showFollowUpButtons: true,
    maxFollowUps: 3,
    avatar: {
      type: 'logo',
    },
  },
  colors: {
    primary: '#5B1A8C', // Main purple theme
    primaryLight: '#FDFEFD',
    primaryDark: '#2B4A7D', // Darker blue-purple
    primaryVibrant: '#A03BA8', // Lighter purple accent
    gradientStart: '#2B4A7D',
    gradientMid: '#5B1A8C',
    gradientEnd: '#A03BA8',
    darkBg: '#0A0A0A',
    darkCard: 'rgba(91, 26, 140, 0.3)',
    darkSurface: 'rgba(43, 74, 125, 0.4)',
    glassBg: 'rgba(91, 26, 140, 0.05)',
    glassBorder: 'rgba(253, 254, 253, 0.1)',
    glassShadow: 'rgba(91, 26, 140, 0.2)',
    textPrimary: '#FDFEFD',
    textSecondary: 'rgba(253, 254, 253, 0.7)',
    textTertiary: 'rgba(253, 254, 253, 0.5)',
    textMuted: 'rgba(253, 254, 253, 0.4)',
    white: '#FDFEFD',
    borderLight: 'rgba(253, 254, 253, 0.08)',
    borderMedium: 'rgba(253, 254, 253, 0.12)',
    borderAccent: 'rgba(91, 26, 140, 0.3)',
    borderGlow: 'rgba(91, 26, 140, 0.4)',
    borderColor: 'rgba(91, 26, 140, 0.2)',
    greenSuccess: '#10B981',
    cyanAccent: '#6EA5D4', // Light blue accent
    orangeAccent: '#A03BA8', // Purple accent
    goldAccent: '#A03BA8', // Purple accent
    bgPrimary: 'rgba(43, 74, 125, 0.05)',
    bgHeader: 'rgba(43, 74, 125, 0.85)',
    bgMessageArea: 'rgba(91, 26, 140, 0.03)',
    bgHover: 'rgba(91, 26, 140, 0.12)',
    bgActive: 'rgba(91, 26, 140, 0.15)',
    bubbleUserBg: 'rgba(91, 26, 140, 0.08)', // User tint: #5B1A8C
    bubbleUserBorder: 'rgba(253, 254, 253, 0.25)',
    bubbleUserShadow: '0 8px 32px rgba(91, 26, 140, 0.15)',
    bubbleAiBg: 'rgba(43, 74, 125, 0.05)', // AI tint: #2B4A7D
    bubbleAiBorder: 'rgba(253, 254, 253, 0.1)',
    bubbleAiShadow: '0 8px 32px rgba(43, 74, 125, 0.1)',
    buttonBg: 'rgba(91, 26, 140, 0.12)',
    buttonHover: 'rgba(91, 26, 140, 0.2)',
    buttonActive: 'rgba(91, 26, 140, 0.3)',
  },
  quickButtons: ['What\'s PROXe', 'Deploy PROXe', 'PROXe Pricing', 'Book a Demo'],
  followUpButtons: ['Deploy PROXe', 'Book PROXe Demo', 'Industries Served', 'Get PROXe Pricing', 'Schedule a Call'],
  firstMessageButtons: ['Book a Demo', 'PROXe Pricing', 'Industries Served'], // Buttons for first message only
};

