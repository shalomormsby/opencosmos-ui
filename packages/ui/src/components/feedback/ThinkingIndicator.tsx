'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { cn } from '../../lib/utils';
import { InfinityAnim, type InfinityAnimPalette } from '../backgrounds/InfinityAnim';

/* ── Phrase pools ─────────────────────────────────────────────────────── */

/**
 * Landing-page intro phrases — display once, in order, before the rotating
 * `LANDING_PHRASES` pool starts cycling. Used automatically by `pool="landing"`.
 */
export const LANDING_INTRO: readonly string[] = [
  'Welcome to OpenCosmos.',
  'You are most welcome here.',
];

/** Rotating phrase pool for hero / landing surfaces. */
export const LANDING_PHRASES: readonly string[] = [
  'The stardust in me recognizes the stardust in you.',
  'Let’s explore together.',
  'Where shall we begin?',
  'What would you like to explore?',
  'What’s true for you in this moment?',
  'Shall we inquire?',
  'Do you have a stressful thought you’d like to investigate?',
  'What are you curious about?',
  'What’s alive in you right now?',
  'What have you been sitting with recently?',
  'What’s on your mind, in your heart, or on your horizon?',
  'What would you like to bring into the light?',
  'The universe is listening.',
  'This is a safe space to explore.',
  'Come as you are.',
  'No wrong doors here.',
  'You’ve arrived at the precisely perfect moment.',
  'Your whole self is welcome here.',
  'Even the strangest questions are welcome here.',
  'Every question opens a portal.',
  'What you seek is actively seeking you.',
  'You are the universe exploring itself.',
  'It starts with a single heartfelt question.',
  'The most important question is the one you’re about to ask.',
  'The universe birthed itself into being so we can be here now.',
  'The vast library of human wisdom opens its doors to you.',
  'The universe is discovering itself as you.',
];

/** Rotating phrase pool for Cosmo chat / dialog thinking states. */
export const CHAT_PHRASES: readonly string[] = [
  'Following the Golden Thread…',
  'Attuning to the wisdom of your question…',
  'Exploring the deeper dimensions…',
  'Consulting centuries of human wisdom…',
  'Pondering deeply…',
  'Seeking wisdom…',
  'Reflecting your wisdom…',
  'Creating connections…',
  'Celebrating your curiosity…',
  'Challenging assumptions…',
  'Exploring infinitudes…',
  'Seeking other angles…',
  'Holding this with care…',
  'Sitting with your question…',
  'Giving your question breathing room…',
  'Letting this breathe…',
  'Flowing with this…',
  'Focusing on the essence…',
  'Receiving what you’ve shared…',
  'Seeking the question beneath the question…',
  'Consulting the cosmos…',
  'Plumbing the depths…',
  'Composing a thoughtful response…',
  'This deserves care…',
  'Not rushing.',
  'Exploring multiple paths…',
  'Weaving threads together…',
  'Tracing patterns across traditions…',
  'Bridging heart and mind…',
  'Letting the question lead…',
  'Searching for what wants to be seen…',
  'Building bridges…',
  'Distilling what’s true…',
  'Filtering out the noise…',
  'Something is crystallizing…',
  'Tracing back to the source…',
];

/** Detects phrases that already end with terminal punctuation; suppresses the
 *  appended ellipsis so we don't double up (e.g. "Pondering deeply….."). */
const TERMINAL_PUNCT_RE = /[.!?…]$/;

/* ── Types ────────────────────────────────────────────────────────────── */

export interface ThinkingIndicatorProps {
  /**
   * Which built-in phrase pool to cycle through.
   * Ignored if `phrases` is provided.
   * @default 'chat'
   */
  pool?: 'landing' | 'chat';
  /** Custom phrase array — overrides `pool`. */
  phrases?: readonly string[];
  /**
   * Phrases that play once in order at mount, before the rotating pool starts.
   * When `pool="landing"` is used without overrides, this defaults to
   * `LANDING_INTRO`. Pass `[]` to disable the intro.
   */
  introPhrases?: readonly string[];
  /** Milliseconds each phrase remains before transitioning. @default 2800 */
  cycleMs?: number;
  /** Shuffle the rotating pool on mount (intro is never shuffled). @default false */
  shuffle?: boolean;
  /**
   * Show the leading brand mark (xs InfinityAnim — orbiting comet).
   * @default true
   */
  mark?: boolean;
  /**
   * Color palette for the leading mark. Pass any preset from
   * `InfinityAnimPalette`. @default 'pink-blue'
   */
  markPalette?: InfinityAnimPalette;
  /** Append a trailing ellipsis that blooms in with the text. @default true */
  showEllipsis?: boolean;
  /** Visual size. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label for screen readers. @default 'Thinking' */
  label?: string;
  /** Optional className for positioning. */
  className?: string;
}

/* ── Bloom write-on (per-character stagger, with optional trailing dots) ─ */

interface BloomTextProps {
  text: string;
  showEllipsis: boolean;
  shouldAnimate: boolean;
}

const ELLIPSIS = '...';

function BloomText({ text, showEllipsis, shouldAnimate }: BloomTextProps) {
  const baseChars = text.split('');
  const ellipsisChars = showEllipsis ? ELLIPSIS.split('') : [];
  const totalLen = baseChars.length + ellipsisChars.length;

  if (!shouldAnimate) {
    return (
      <span aria-hidden="true">
        {text}
        {showEllipsis && <span style={{ letterSpacing: '-0.05em' }}>{ELLIPSIS}</span>}
      </span>
    );
  }

  const stagger = Math.max(8, Math.floor(600 / Math.max(totalLen, 1))) / 1000;

  return (
    <span aria-hidden="true">
      {baseChars.map((char, i) => (
        <motion.span
          key={`b-${i}`}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: i * stagger, ease: 'easeOut' }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </motion.span>
      ))}
      {ellipsisChars.map((char, i) => (
        <motion.span
          key={`e-${i}`}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            delay: (baseChars.length + i) * stagger,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', letterSpacing: '-0.05em' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */

const SIZE_CLASSES = {
  sm: { text: 'text-xs', gap: 'gap-2' },
  md: { text: 'text-sm', gap: 'gap-2.5' },
  lg: { text: 'text-base', gap: 'gap-3' },
} as const;

function shuffleArray<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * ThinkingIndicator
 *
 * Write-on / bloom text animation for AI thinking states and hero surfaces.
 * Cycles a phrase pool with per-character stagger, a leading orbiting brand
 * mark (xs `InfinityAnim`), and a trailing ellipsis that blooms in with the
 * rest of the text. Width is locked to the longest phrase so the indicator
 * does not jump as phrases change. Fully gated by `useMotionPreference`.
 */
export function ThinkingIndicator({
  pool = 'chat',
  phrases,
  introPhrases,
  cycleMs = 2800,
  shuffle = false,
  mark = true,
  markPalette = 'pink-blue',
  showEllipsis = true,
  size = 'md',
  label = 'Thinking',
  className,
}: ThinkingIndicatorProps) {
  const { shouldAnimate } = useMotionPreference();

  const sourcePool = phrases ?? (pool === 'landing' ? LANDING_PHRASES : CHAT_PHRASES);
  // Default intro is enabled only when the consumer didn't pass custom phrases.
  // This way, `pool="landing"` auto-includes LANDING_INTRO, but a custom
  // `phrases={...}` doesn't get an unrelated intro tacked on.
  const sourceIntro = introPhrases ?? (phrases ? [] : pool === 'landing' ? LANDING_INTRO : []);

  const orderedPhrases = React.useMemo(() => {
    const main = shuffle ? shuffleArray(sourcePool) : [...sourcePool];
    return [...sourceIntro, ...main];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcePool.join('|'), sourceIntro.join('|'), shuffle]);

  const introLen = sourceIntro.length;

  const [index, setIndex] = React.useState(0);

  // After reaching the end, wrap to the start of the rotating pool — the
  // intro plays exactly once per mount.
  React.useEffect(() => {
    if (orderedPhrases.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const next = i + 1;
        return next >= orderedPhrases.length ? introLen : next;
      });
    }, cycleMs);
    return () => clearInterval(id);
  }, [orderedPhrases.length, cycleMs, introLen]);

  const sizeCfg = SIZE_CLASSES[size];
  const currentPhrase = orderedPhrases[index] ?? '';
  const longestPhrase = React.useMemo(
    () => orderedPhrases.reduce((a, b) => (a.length >= b.length ? a : b), ''),
    [orderedPhrases],
  );

  // Suppress the appended "..." when the phrase already ends with terminal
  // punctuation, so we don't render "Pondering deeply…..." or "Welcome..."
  const phraseEndsTerminal = TERMINAL_PUNCT_RE.test(currentPhrase);
  const effectiveShowEllipsis = showEllipsis && !phraseEndsTerminal;

  // Drive the InfinityAnim mark in sympathy with the bloom write-on:
  // it orbits while characters are appearing, then eases to a stop while
  // the phrase is settled, then resumes when the next phrase writes on.
  // Mirrors the previous sparkle's "spin once per phrase change" feel but
  // with continuous orbital motion instead of a single spin.
  const [isWriting, setIsWriting] = React.useState(true);
  React.useEffect(() => {
    const totalLen = currentPhrase.length + (effectiveShowEllipsis ? ELLIPSIS.length : 0);
    const stagger = Math.max(8, Math.floor(600 / Math.max(totalLen, 1))) / 1000;
    // Per-character bloom = duration 0.28 + delay i * stagger; total = stagger*totalLen + 0.28.
    const bloomMs = (totalLen * stagger + 0.28) * 1000;
    setIsWriting(true);
    const t = setTimeout(() => setIsWriting(false), bloomMs);
    return () => clearTimeout(t);
  }, [index, currentPhrase, effectiveShowEllipsis]);

  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className={cn(
        'inline-flex items-center text-[var(--color-text-secondary)]',
        sizeCfg.gap,
        sizeCfg.text,
        className,
      )}
    >
      {mark && (
        <span className="shrink-0 inline-flex items-center">
          <InfinityAnim
            size="xs"
            technique="dashes"
            palette={markPalette}
            runWhile={isWriting}
          />
        </span>
      )}
      {/* Width-locked, left-aligned text area: an invisible ghost sized to the
          longest phrase reserves the column; the animated text sits on top. */}
      <span className="relative inline-block text-left">
        <span aria-hidden="true" className="invisible whitespace-pre">
          {longestPhrase}
          {showEllipsis && <span style={{ letterSpacing: '-0.05em' }}>{ELLIPSIS}</span>}
        </span>
        <span className="absolute inset-0 whitespace-pre">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={index}
              initial={shouldAnimate ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={shouldAnimate ? { opacity: 0 } : undefined}
              transition={{ duration: 0.18 }}
              style={{ display: 'inline-block' }}
            >
              <BloomText
                text={currentPhrase}
                showEllipsis={effectiveShowEllipsis}
                shouldAnimate={shouldAnimate}
              />
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
