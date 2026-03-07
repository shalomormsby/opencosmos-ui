/**
 * Speedboat Theme Tokens
 * Moloco Speedboat V2 design language
 * Extracted from Figma (Speedboat V2) via design-code-play/frontend/src/theme.ts
 *
 * Colors: Blue-accented professional palette with Roboto + Montserrat typography
 * Accent: #346BEA (Core/Blue500-Accent)
 */

export const speedboatTokens = {
  light: {
    colors: {
      // Backgrounds
      background: '#FFFFFF',
      backgroundSecondary: '#F8F8F8',   // grey50
      backgroundTertiary: '#ECECEC',     // grey100

      // Foregrounds
      foreground: '#212121',             // grey900 — ContentPrimary
      foregroundSecondary: '#5D5D5D',    // grey700 — ContentSecondary
      foregroundTertiary: '#8891A7',     // grey500 — muted icons

      // Brand
      primary: '#346BEA',               // accent blue
      primaryForeground: '#FFFFFF',

      secondary: '#EBF0FD',             // blue100 — chip bg
      secondaryForeground: '#1E49AA',   // blue600 — chip text

      accent: '#346BEA',                // same as primary for Speedboat
      accentForeground: '#FFFFFF',

      // Borders
      border: '#ECECEC',                // grey100 — BorderPrimary
      borderSubtle: '#F8F8F8',          // grey50

      // States
      hover: '#F8F8F8',                 // grey50
      active: '#ECECEC',                // grey100

      // Link hover states
      linkHover: '#1E49AA',             // blue600
      linkHoverForeground: '#FFFFFF',

      // Semantic
      success: '#2E7D32',
      successForeground: '#FFFFFF',

      warning: '#E65100',
      warningForeground: '#FFFFFF',

      error: '#C62828',
      errorForeground: '#FFFFFF',

      info: '#346BEA',
      infoForeground: '#FFFFFF',

      // Component-specific colors
      card: '#FFFFFF',
      cardForeground: '#212121',

      popover: '#FFFFFF',
      popoverForeground: '#212121',

      muted: '#F8F8F8',                 // grey50
      mutedForeground: '#8891A7',       // grey500

      destructive: '#C62828',           // error red
      destructiveForeground: '#FFFFFF',

      input: '#DFDFDF',                 // grey200 — input borders
      ring: '#346BEA',                  // accent blue for focus rings

      // Surface
      surface: '#F8F8F8',               // grey50

      // Glass effects
      glass: 'rgba(255, 255, 255, 0.85)',
      glassBorder: 'rgba(0, 0, 0, 0.08)',
    },

    effects: {
      blur: {
        sm: 'blur(4px)',
        md: 'blur(8px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
      },

      shadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 2px 8px rgba(0, 0, 0, 0.08)',
        lg: '0 4px 16px rgba(0, 0, 0, 0.10)',
        xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
        '2xl': '0 16px 48px rgba(0, 0, 0, 0.16)',
      },
    },
  },

  dark: {
    colors: {
      // Backgrounds — derived dark palette
      background: '#0F1117',
      backgroundSecondary: '#1A1C25',
      backgroundTertiary: '#252833',

      // Foregrounds
      foreground: '#F0F0F2',
      foregroundSecondary: '#A0A3B1',
      foregroundTertiary: '#6B6F80',

      // Brand — keep the accent blue, slightly brighten for dark bg
      primary: '#4A7FF7',
      primaryForeground: '#FFFFFF',

      secondary: '#1E2540',
      secondaryForeground: '#A6C1FF',   // blue300

      accent: '#4A7FF7',
      accentForeground: '#FFFFFF',

      // Borders
      border: '#2E3140',
      borderSubtle: '#1A1C25',

      // States
      hover: '#1A1C25',
      active: '#252833',

      // Link hover states
      linkHover: '#A6C1FF',             // blue300 — lighter for dark mode
      linkHoverForeground: '#0F1117',

      // Semantic — slightly brighter versions for dark bg
      success: '#4CAF50',
      successForeground: '#FFFFFF',

      warning: '#FF8A50',
      warningForeground: '#FFFFFF',

      error: '#EF5350',
      errorForeground: '#FFFFFF',

      info: '#4A7FF7',
      infoForeground: '#FFFFFF',

      // Component-specific colors
      card: '#1A1C25',
      cardForeground: '#F0F0F2',

      popover: '#1A1C25',
      popoverForeground: '#F0F0F2',

      muted: '#252833',
      mutedForeground: '#6B6F80',

      destructive: '#EF5350',
      destructiveForeground: '#FFFFFF',

      input: '#2E3140',
      ring: '#4A7FF7',

      // Surface
      surface: '#1A1C25',

      // Glass effects
      glass: 'rgba(15, 17, 23, 0.85)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
    },

    effects: {
      blur: {
        sm: 'blur(4px)',
        md: 'blur(8px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
      },

      shadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.20)',
        md: '0 2px 8px rgba(0, 0, 0, 0.30)',
        lg: '0 4px 16px rgba(0, 0, 0, 0.35)',
        xl: '0 8px 24px rgba(0, 0, 0, 0.40)',
        '2xl': '0 16px 48px rgba(0, 0, 0, 0.50)',
      },
    },
  },

  /**
   * Motion personality for Speedboat theme
   * Professional and snappy — slightly faster than Studio
   */
  motion: {
    getDuration: (intensity: number): string => {
      if (intensity === 0) return '0ms';
      const ms = 120 + (intensity - 1) * 35;
      return `${ms}ms`;
    },

    ease: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },

  /**
   * Interaction tokens for Speedboat theme
   * Professional, clean — matches Studio's subtle feel
   */
  interactions: {
    hover: { overlayColor: { light: '#000000', dark: '#ffffff' }, opacity: 0.06 },
    active: { scale: 0.98 },
    focus: { ringWidth: '2px', ringOffset: '2px' },
    disabled: { opacity: 0.5 },
  },

  /**
   * Typography for Speedboat theme
   * Montserrat headings + Roboto body — Moloco brand fonts
   */
  typography: {
    heading: {
      fontFamily: 'var(--font-montserrat)',
      fontWeight: '700',
      letterSpacing: '-0.01em',
    },

    body: {
      fontFamily: 'var(--font-roboto)',
      fontWeight: '400',
      letterSpacing: '0',
    },

    mono: {
      fontFamily: 'var(--font-geist-mono)',
      fontWeight: '400',
      letterSpacing: '0',
    },
  },
} as const;

export type SpeedboatTheme = typeof speedboatTokens;
