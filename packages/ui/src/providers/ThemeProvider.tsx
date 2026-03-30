'use client';

/**
 * Theme Provider
 * Applies theme tokens as CSS variables and manages transitions
 */

import { useEffect, useState } from 'react';
import { useThemeStore } from '../lib/store/theme';
import { useCustomizer, type ColorPalette } from '../lib/store/customizer';
import { studioTokens, terraTokens, voltTokens, speedboatTokens, syntaxColors, codeColors } from '@opencosmos/tokens';
import type { ThemeName, ColorMode } from '@opencosmos/tokens';

// ── Type-safe token access ──────────────────────────────────────────────────

interface ThemeTokenColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  foreground: string;
  foregroundSecondary: string;
  foregroundTertiary: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  borderSubtle: string;
  hover: string;
  active: string;
  linkHover: string;
  linkHoverForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  glass: string;
  glassBorder: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  muted?: string;
  mutedForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  input?: string;
  ring?: string;
  surface?: string;
  link?: string;
  primaryHover?: string;
  accentHover?: string;
}

interface ThemeTokenEffects {
  blur: { sm: string; md: string; lg: string; xl: string };
  shadow: { sm: string; md: string; lg: string; xl: string; '2xl': string };
}

interface InteractionTokens {
  hover: { overlayColor: { light: string; dark: string }; opacity: number };
  active: { scale: number };
  focus: { ringWidth: string; ringOffset: string };
  disabled: { opacity: number };
}

interface ThemeMotion {
  getDuration: (intensity: number) => string;
  ease: { default: string; in: string; out: string; spring: string };
}

interface ThemeModeTokens {
  colors: ThemeTokenColors;
  effects: ThemeTokenEffects;
}

// ── Theme token map ─────────────────────────────────────────────────────────

const themeTokens = {
  studio: studioTokens,
  terra: terraTokens,
  volt: voltTokens,
  speedboat: speedboatTokens,
} satisfies Record<ThemeName, any>;

// Font family map (CSS variables defined in layout)
const fontFamilies: Record<ThemeName, Record<string, string>> = {
  studio: {
    heading: 'var(--font-studio-heading)',
    body: 'var(--font-studio-body)',
    mono: 'var(--font-mono)',
  },
  terra: {
    sans: 'var(--font-terra-body)',
    serif: 'var(--font-terra-heading)',
    mono: 'var(--font-mono)',
  },
  volt: {
    sans: 'var(--font-volt-heading)',
    mono: 'var(--font-mono)',
  },
  speedboat: {
    heading: 'var(--font-montserrat)',
    body: 'var(--font-roboto)',
    mono: 'var(--font-mono)',
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Extract raw pixel value from blur() CSS function */
function extractBlurValue(blurFunction: string): string {
  const match = blurFunction.match(/blur\(([^)]+)\)/);
  return match ? match[1] : '8px';
}

// ── Token → CSS variable mapping ────────────────────────────────────────────

/**
 * Convert theme tokens to CSS variables
 */
function getThemeVars(theme: ThemeName, mode: ColorMode, motionIntensity: number): Record<string, string> {
  const tokens = themeTokens[theme];
  const modeTokens = tokens[mode] as ThemeModeTokens;
  const colors = modeTokens?.colors;
  const effects = modeTokens?.effects;
  const fonts = fontFamilies[theme];
  const motion = tokens.motion as ThemeMotion | undefined;
  const interactions = (tokens as any).interactions as InteractionTokens | undefined;

  // Compute motion duration from theme + user preference
  const duration = motion?.getDuration?.(motionIntensity) || '300ms';
  const durationMs = parseInt(duration) || 300;

  return {
    // Colors - Base
    '--color-background': colors?.background || '#ffffff',
    '--color-background-secondary': colors?.backgroundSecondary || colors?.background || '#fafafa',
    '--color-background-tertiary': colors?.backgroundTertiary || colors?.backgroundSecondary || colors?.background || '#f5f5f5',
    '--color-foreground': colors?.foreground || '#0a0a0a',
    '--color-primary': colors?.primary || '#0a0a0a',
    '--color-primary-foreground': colors?.primaryForeground || '#ffffff',
    '--color-secondary': colors?.secondary || '#f5f5f5',
    '--color-secondary-foreground': colors?.secondaryForeground || '#0a0a0a',
    '--color-accent': colors?.accent || colors?.primary || '#0070f3',
    '--color-accent-foreground': colors?.accentForeground || '#ffffff',
    '--color-success': colors?.success || '#00a86b',
    '--color-success-foreground': colors?.successForeground || '#ffffff',
    '--color-warning': colors?.warning || '#f59e0b',
    '--color-warning-foreground': colors?.warningForeground || '#ffffff',
    '--color-error': colors?.error || '#ef4444',
    '--color-error-foreground': colors?.errorForeground || '#ffffff',
    '--color-info': colors?.info || colors?.accent || '#0070f3',
    '--color-info-foreground': colors?.infoForeground || '#ffffff',
    '--color-glass': colors?.glass || 'rgba(255, 255, 255, 0.7)',
    '--color-glass-border': colors?.glassBorder || 'rgba(0, 0, 0, 0.1)',

    // Semantic color aliases (matching README examples)
    '--color-text-primary': colors?.foreground || '#0a0a0a',
    '--color-text-secondary': colors?.foregroundSecondary || '#525252',
    '--color-text-muted': colors?.foregroundTertiary || '#a3a3a3',
    '--color-surface': colors?.backgroundSecondary || colors?.background || '#fafafa',
    '--color-border': colors?.border || colors?.glassBorder || 'rgba(0, 0, 0, 0.1)',
    '--color-focus': colors?.accent || colors?.primary || '#0070f3',

    // Links and focus rings (can be overridden by derived tokens)
    '--color-link': colors?.link || colors?.primary || '#0a0a0a',
    '--color-ring': colors?.ring || colors?.primary || '#0a0a0a',

    // Interactive states
    '--color-hover': colors?.hover || colors?.backgroundSecondary || '#fafafa',
    '--color-active': colors?.active || colors?.backgroundTertiary || '#f0f0f0',
    '--color-link-hover': colors?.linkHover || colors?.primary || '#0a0a0a',
    '--color-link-hover-foreground': colors?.linkHoverForeground || colors?.background || '#ffffff',

    // Component-specific (previously only set in globals.css defaults)
    '--color-card': colors?.card || colors?.background || '#ffffff',
    '--color-card-foreground': colors?.cardForeground || colors?.foreground || '#0a0a0a',
    '--color-popover': colors?.popover || colors?.background || '#ffffff',
    '--color-popover-foreground': colors?.popoverForeground || colors?.foreground || '#0a0a0a',
    '--color-muted': colors?.muted || colors?.backgroundSecondary || '#f5f5f5',
    '--color-muted-foreground': colors?.mutedForeground || colors?.foregroundTertiary || '#737373',
    '--color-destructive': colors?.destructive || colors?.error || '#ef4444',
    '--color-destructive-foreground': colors?.destructiveForeground || '#ffffff',
    '--color-input': colors?.input || colors?.border || '#d4d4d4',

    // Effects - Blur (full function for style attributes)
    '--effect-blur-sm': effects?.blur?.sm || 'blur(4px)',
    '--effect-blur-md': effects?.blur?.md || 'blur(8px)',
    '--effect-blur-lg': effects?.blur?.lg || 'blur(16px)',
    '--effect-blur-xl': effects?.blur?.xl || effects?.blur?.lg || 'blur(24px)',

    // Effects - Blur (raw values for Tailwind blur-*/backdrop-blur-* utilities)
    '--blur-sm': extractBlurValue(effects?.blur?.sm || 'blur(4px)'),
    '--blur-md': extractBlurValue(effects?.blur?.md || 'blur(8px)'),
    '--blur-lg': extractBlurValue(effects?.blur?.lg || 'blur(16px)'),
    '--blur-xl': extractBlurValue(effects?.blur?.xl || 'blur(24px)'),

    // Effects - Shadow (complete set)
    '--effect-shadow-sm': effects?.shadow?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--effect-shadow-md': effects?.shadow?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--effect-shadow-lg': effects?.shadow?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '--effect-shadow-xl': effects?.shadow?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '--effect-shadow-2xl': effects?.shadow?.['2xl'] || '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Interaction tokens (theme-aware)
    '--color-interaction-overlay': interactions?.hover?.overlayColor?.[mode] || (mode === 'dark' ? '#ffffff' : '#000000'),
    '--opacity-interaction-hover': String(interactions?.hover?.opacity ?? 0.08),
    '--scale-interaction-active': String(interactions?.active?.scale ?? 0.98),
    '--color-interaction-focus-ring': colors?.ring || colors?.primary || '#0a0a0a',
    '--width-interaction-focus-ring': interactions?.focus?.ringWidth || '2px',
    '--width-interaction-focus-offset': interactions?.focus?.ringOffset || '2px',
    '--opacity-interaction-disabled': String(interactions?.disabled?.opacity ?? 0.5),

    // Typography - Font Families
    '--font-heading': fonts?.heading || (theme === 'terra' && fonts?.serif ? fonts.serif : fonts?.sans) || 'var(--font-studio-heading)',
    '--font-body': fonts?.body || fonts?.sans || 'var(--font-studio-body)',
    '--font-mono': fonts?.mono || 'var(--font-studio-mono)',

    // Motion - Easing (complete set)
    '--ease-default': motion?.ease?.default || 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--ease-in': motion?.ease?.in || 'cubic-bezier(0.4, 0, 1, 1)',
    '--ease-out': motion?.ease?.out || 'cubic-bezier(0, 0, 0.2, 1)',
    '--ease-spring': motion?.ease?.spring || 'cubic-bezier(0.16, 1, 0.3, 1)',

    // Motion - Duration (computed from theme + user motion preference)
    '--duration-default': duration,
    '--duration-fast': `${Math.max(0, Math.round(durationMs * 0.5))}ms`,
    '--duration-slow': `${Math.min(1000, Math.round(durationMs * 1.5))}ms`,

    // Syntax Highlighting - Based on VS Code Dark+ theme
    '--syntax-comment': mode === 'light' ? syntaxColors.light.comment : syntaxColors.dark.comment,
    '--syntax-keyword': mode === 'light' ? syntaxColors.light.keyword : syntaxColors.dark.keyword,
    '--syntax-function': mode === 'light' ? syntaxColors.light.function : syntaxColors.dark.function,
    '--syntax-string': mode === 'light' ? syntaxColors.light.string : syntaxColors.dark.string,
    '--syntax-number': mode === 'light' ? syntaxColors.light.number : syntaxColors.dark.number,
    '--syntax-boolean': mode === 'light' ? syntaxColors.light.boolean : syntaxColors.dark.boolean,
    '--syntax-operator': mode === 'light' ? syntaxColors.light.operator : syntaxColors.dark.operator,
    '--syntax-property': mode === 'light' ? syntaxColors.light.property : syntaxColors.dark.property,
    '--syntax-className': mode === 'light' ? syntaxColors.light.className : syntaxColors.dark.className,
    '--syntax-tag': mode === 'light' ? syntaxColors.light.tag : syntaxColors.dark.tag,
    '--syntax-attribute': mode === 'light' ? syntaxColors.light.attribute : syntaxColors.dark.attribute,
    '--syntax-variable': mode === 'light' ? syntaxColors.light.variable : syntaxColors.dark.variable,
    '--syntax-punctuation': mode === 'light' ? syntaxColors.light.punctuation : syntaxColors.dark.punctuation,
    '--syntax-plain': mode === 'light' ? syntaxColors.light.plain : syntaxColors.dark.plain,

    // Code Block Backgrounds and Borders - Accessible contrast (WCAG AA 4.5:1)
    '--code-block-bg': mode === 'light' ? codeColors.light.blockBackground : codeColors.dark.blockBackground,
    '--code-inline-bg': mode === 'light' ? codeColors.light.inlineBackground : codeColors.dark.inlineBackground,
    '--code-border': mode === 'light' ? codeColors.light.border : codeColors.dark.border,
  };
}

/**
 * Merge custom color palette with base theme tokens
 * This is where "change once, ripple everywhere" happens!
 */
function mergeCustomColorTokens(
  baseTokens: Record<string, string>,
  customPalette: ColorPalette
): Record<string, string> {
  return {
    ...baseTokens,

    // Override primary color
    '--color-primary': customPalette.primary,
    '--color-primary-foreground': customPalette.primaryForeground,

    // Apply color scale (for utilities like bg-primary-200)
    '--color-primary-50': customPalette.scale[50],
    '--color-primary-100': customPalette.scale[100],
    '--color-primary-200': customPalette.scale[200],
    '--color-primary-300': customPalette.scale[300],
    '--color-primary-400': customPalette.scale[400],
    '--color-primary-500': customPalette.scale[500],
    '--color-primary-600': customPalette.scale[600],
    '--color-primary-700': customPalette.scale[700],
    '--color-primary-800': customPalette.scale[800],
    '--color-primary-900': customPalette.scale[900],

    // Override secondary color if provided (advanced mode)
    ...(customPalette.secondary && {
      '--color-secondary': customPalette.secondary,
      '--color-secondary-foreground': customPalette.secondaryForeground || baseTokens['--color-secondary-foreground'],
    }),

    // Override accent color if provided (advanced mode)
    ...(customPalette.accent && {
      '--color-accent': customPalette.accent,
      '--color-accent-foreground': customPalette.accentForeground || baseTokens['--color-accent-foreground'],
    }),

    // Apply ALL derived tokens from dependency graph
    ...customPalette.derivedTokens,
  };
}

/**
 * Validate theme tokens in development mode
 */
function validateThemeTokens(theme: ThemeName, mode: ColorMode): void {
  // @ts-expect-error - process.env is injected by bundler
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return;

  const root = document.documentElement;
  const style = getComputedStyle(root);

  const requiredTokens = [
    '--color-background',
    '--color-foreground',
    '--color-primary',
    '--color-primary-foreground',
    '--color-border',
    '--color-ring',
    '--font-heading',
    '--font-body',
    '--font-mono',
  ];

  const missingTokens: string[] = [];
  const invalidTokens: string[] = [];

  requiredTokens.forEach((token) => {
    const value = style.getPropertyValue(token).trim();

    if (!value) {
      missingTokens.push(token);
    } else if (token.startsWith('--color-') && !value.match(/^(#|rgb|hsl|var\()/)) {
      invalidTokens.push(`${token} = "${value}"`);
    } else if (token.startsWith('--font-') && value === '') {
      invalidTokens.push(`${token} = empty`);
    }
  });

  if (missingTokens.length > 0) {
    console.warn(
      `[ThemeProvider] Missing CSS variables for theme "${theme}" (${mode} mode):`,
      missingTokens
    );
  }

  if (invalidTokens.length > 0) {
    console.warn(
      `[ThemeProvider] Invalid CSS variable values for theme "${theme}" (${mode} mode):`,
      invalidTokens
    );
  }

  if (missingTokens.length === 0 && invalidTokens.length === 0) {
    console.log(`[ThemeProvider] ✓ Theme validation passed for "${theme}" (${mode} mode)`);
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Default theme to use on first load (before localStorage).
   * Does NOT override a previously persisted theme.
   */
  defaultTheme?: ThemeName;
  /**
   * Default color mode to use on first load (before localStorage).
   * Does NOT override a previously persisted mode.
   */
  defaultMode?: ColorMode;
}

export function ThemeProvider({ children, defaultTheme, defaultMode }: ThemeProviderProps) {
  const { theme, mode, setTheme, setMode } = useThemeStore();
  const customPalette = useCustomizer((state) => state.customColors?.[theme]?.[mode]);
  const motionIntensity = useCustomizer((state) => state.motion);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Apply defaults on first mount if no persisted preference exists
  useEffect(() => {
    if (!defaultTheme && !defaultMode) return;
    const persisted = typeof window !== 'undefined' && localStorage.getItem('ecosystem-theme');
    if (persisted) return;
    if (defaultTheme) setTheme(defaultTheme);
    if (defaultMode) setMode(defaultMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme variables with transition
  useEffect(() => {
    if (!mounted) return;

    setIsTransitioning(true);

    const root = document.documentElement;

    // 1. Get base theme tokens (including motion-aware durations)
    const baseTokens = getThemeVars(theme, mode, motionIntensity);

    // 2. Debug logging (development only)
    // @ts-expect-error - process.env is injected by bundler
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.log('[ThemeProvider] Update:', {
        theme,
        mode,
        motionIntensity,
        hasCustomPalette: !!customPalette,
        customPrimary: customPalette?.primary,
        timestamp: new Date().toISOString()
      });
    }

    // 3. Merge tokens (custom overrides base)
    const finalTokens = customPalette
      ? mergeCustomColorTokens(baseTokens, customPalette)
      : baseTokens;

    // Apply transition class
    root.classList.add('theme-transitioning');

    // Apply CSS variables IMMEDIATELY
    Object.entries(finalTokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set data attributes for theme and mode
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-custom-colors', customPalette ? 'active' : 'default');

    // Toggle 'dark' class for Tailwind dark: modifier support
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Validate theme tokens in development mode
    validateThemeTokens(theme, mode);

    // End transition after animation completes
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [theme, mode, mounted, customPalette, motionIntensity]);

  return <>{children}</>;
}
