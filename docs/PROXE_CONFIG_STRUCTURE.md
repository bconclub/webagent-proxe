# PROXe Brand Configuration & Theme Structure

## 📁 File Structure

```
proxe/src/
├── configs/
│   ├── brand.config.ts          # Main brand config (used by ChatWidget)
│   ├── proxe.config.ts          # Type definitions + legacy config
│   └── index.ts                  # Exports
└── styles/
    ├── theme.css                 # Main theme CSS variables
    └── themes/
        └── proxe.css             # Brand-specific theme (legacy)
```

## 1. `proxe/src/configs/brand.config.ts`

This is the **main configuration file** used by the ChatWidget component.

```typescript
import type { BrandConfig } from '@/configs';

export const proxeConfig: BrandConfig = {
  name: 'PROXe',
  brand: 'proxe',
  apiUrl: '/api/chat',
  systemPrompt: {
    path: '@/api/prompts/proxe-prompt',
  },
  styles: {
    themePath: '@/styles/theme.css',  // Points to main theme.css
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
    // Primary Colors
    primary: '#5B1A8C',              // Main purple
    primaryLight: '#FDFEFD',          // Light text/background
    primaryDark: '#2B4A7D',           // Darker blue-purple
    primaryVibrant: '#A03BA8',         // Lighter purple accent
    
    // Gradient
    gradientStart: '#2B4A7D',
    gradientMid: '#5B1A8C',
    gradientEnd: '#A03BA8',
    
    // Backgrounds
    darkBg: '#0A0A0A',
    darkCard: 'rgba(91, 26, 140, 0.3)',
    darkSurface: 'rgba(43, 74, 125, 0.4)',
    glassBg: 'rgba(91, 26, 140, 0.05)',
    glassBorder: 'rgba(253, 254, 253, 0.1)',
    glassShadow: 'rgba(91, 26, 140, 0.2)',
    
    // Text Colors
    textPrimary: '#FDFEFD',
    textSecondary: 'rgba(253, 254, 253, 0.7)',
    textTertiary: 'rgba(253, 254, 253, 0.5)',
    textMuted: 'rgba(253, 254, 253, 0.4)',
    white: '#FDFEFD',
    
    // Borders
    borderLight: 'rgba(253, 254, 253, 0.08)',
    borderMedium: 'rgba(253, 254, 253, 0.12)',
    borderAccent: 'rgba(91, 26, 140, 0.3)',
    borderGlow: 'rgba(91, 26, 140, 0.4)',
    borderColor: 'rgba(91, 26, 140, 0.2)',
    
    // Accents
    greenSuccess: '#10B981',
    cyanAccent: '#6EA5D4',
    orangeAccent: '#A03BA8',
    goldAccent: '#A03BA8',
    
    // Background Variants
    bgPrimary: 'rgba(43, 74, 125, 0.05)',
    bgHeader: 'rgba(43, 74, 125, 0.85)',
    bgMessageArea: 'rgba(91, 26, 140, 0.03)',
    bgHover: 'rgba(91, 26, 140, 0.12)',
    bgActive: 'rgba(91, 26, 140, 0.15)',
    
    // Chat Bubbles
    bubbleUserBg: 'rgba(91, 26, 140, 0.25)',
    bubbleUserBorder: 'rgba(91, 26, 140, 0.7)',
    bubbleUserShadow: '0 8px 32px rgba(91, 26, 140, 0.25)',
    bubbleAiBg: 'rgba(43, 74, 125, 0.3)',
    bubbleAiBorder: 'rgba(43, 74, 125, 0.7)',
    bubbleAiShadow: '0 8px 32px rgba(43, 74, 125, 0.25)',
    
    // Buttons
    buttonBg: 'rgba(91, 26, 140, 0.12)',
    buttonHover: 'rgba(91, 26, 140, 0.2)',
    buttonActive: 'rgba(91, 26, 140, 0.3)',
  },
  quickButtons: ['What\'s PROXe', 'Deploy PROXe', 'PROXe Pricing', 'Book a Demo'],
  exploreButtons: ['Web PROXe', 'WhatsApp PROXe', 'Voice PROXe', 'Social PROXe'],
  followUpButtons: ['Schedule a Call', 'Book a Demo', 'Deploy PROXe', 'Get a Call Back', 'Talk to The Team'],
  firstMessageButtons: ['Learn More', 'Book a Demo'],
};
```

## 2. `proxe/src/configs/proxe.config.ts`

This file contains:
- `BrandConfig` interface (type definition)
- Legacy `proxeConfig` export (duplicate of brand.config.ts)

**Note**: The ChatWidget uses `brand.config.ts`, not this file.

## 3. `proxe/src/styles/theme.css`

This is the **main theme file** that defines CSS variables used by the ChatWidget.

```css
/* PROXe Theme CSS Variables */
[data-brand="proxe"],
[data-theme="purple-frost"] {
  /* Main Colors */
  --chatbox-bg: #0F0D0F;
  --accent-1: #5B1A8C;
  --accent-2: #2B4A7D;
  --accent-3: #A03BA8;
  --accent-4: #6EA5D4;
  
  /* Theme Colors */
  --primary-color: #5B1A8C;
  --primary-light: #FDFEFD;
  --primary-dark: #2B4A7D;
  --primary-vibrant: #A03BA8;
  
  /* Backgrounds */
  --dark-bg: #0F0D0F;
  --dark-card: rgba(91, 26, 140, 0.3);
  --dark-surface: rgba(43, 74, 125, 0.4);
  --glass-bg: rgba(91, 26, 140, 0.05);
  --glass-border: rgba(253, 254, 253, 0.1);
  --glass-shadow: rgba(91, 26, 140, 0.2);
  
  /* Text */
  --text-primary: #FDFEFD;
  --text-secondary: rgba(253, 254, 253, 0.7);
  --text-tertiary: rgba(253, 254, 253, 0.5);
  --text-muted: rgba(253, 254, 253, 0.4);
  --white: #FDFEFD;
  
  /* Borders */
  --border-light: rgba(253, 254, 253, 0.08);
  --border-medium: rgba(253, 254, 253, 0.12);
  --border-accent: rgba(91, 26, 140, 0.3);
  --border-glow: rgba(91, 26, 140, 0.4);
  --border-color: rgba(91, 26, 140, 0.2);
  
  /* Other */
  --green-success: #10B981;
  --cyan-accent: #6EA5D4;
  --bg-header: rgba(43, 74, 125, 0.85);
  --bg-message-area: rgba(91, 26, 140, 0.03);
  --bg-primary: rgba(43, 74, 125, 0.05);
  --bg-hover: rgba(91, 26, 140, 0.12);
  --bg-active: rgba(91, 26, 140, 0.15);
  
  /* Bubble backgrounds */
  --bubble-user-bg: rgba(91, 26, 140, 0.25);
  --bubble-user-border: rgba(91, 26, 140, 0.7);
  --bubble-user-shadow: 0 8px 32px rgba(91, 26, 140, 0.25);
  
  --bubble-ai-bg: rgba(43, 74, 125, 0.3);
  --bubble-ai-border: rgba(43, 74, 125, 0.7);
  --bubble-ai-shadow: 0 8px 32px rgba(43, 74, 125, 0.25);
  
  /* Buttons */
  --button-bg: rgba(91, 26, 140, 0.12);
  --button-hover: rgba(91, 26, 140, 0.2);
  --button-active: rgba(91, 26, 140, 0.3);
  
  /* Blur */
  --blur-sm: blur(8px);
  --blur-md: blur(12px);
  --blur-lg: blur(16px);
  --blur-xl: blur(24px);
}
```

## 4. `proxe/src/styles/themes/proxe.css`

This is a **legacy theme file** with similar CSS variables. Currently not actively used (theme.css is the main file).

## 5. How Colors Are Applied

### In ChatWidget Component:

1. **Config Import**: `import { proxeConfig } from '@/configs/brand.config';`
2. **Config Usage**: The config is passed to hooks and used for logic, but **colors are primarily applied via CSS variables**.
3. **CSS Variables**: The `ChatWidget.module.css` uses CSS variables from `theme.css`:
   - `var(--primary-color)`
   - `var(--primary-vibrant)`
   - `var(--text-primary)`
   - `var(--bubble-user-bg)`
   - `var(--bubble-ai-bg)`
   - etc.

### Example from ChatWidget.module.css:

```css
.quickButton {
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-vibrant) 100%);
}

.messageBubble {
  background: var(--bubble-user-bg);
  border: 1px solid var(--bubble-user-border);
  box-shadow: var(--bubble-user-shadow);
}
```

## 6. Layout.tsx Integration

The theme is applied via `data-brand` and `data-theme` attributes:

```tsx
<html lang="en" data-brand="proxe" data-theme="purple-frost">
```

This activates the CSS variables in `theme.css` that target `[data-brand="proxe"]`.

## Summary

- **brand.config.ts**: Main config with all color values (TypeScript object)
- **theme.css**: CSS variables that match the config colors (used by CSS)
- **ChatWidget**: Uses CSS variables from theme.css, not direct config colors
- **Layout**: Sets `data-brand="proxe"` to activate theme CSS variables
