'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMotionPreference } from '../../hooks/useMotionPreference';

export interface TerminalWindowProps {
  /**
   * Window title shown in the title bar (e.g. "Terminal — zsh")
   * @default "Terminal"
   */
  title?: string;
  /**
   * Lines to reveal sequentially, one at a time.
   */
  lines: string[];
  /**
   * Loop the reveal — after the last line, pause, clear, and restart.
   * @default false
   */
  loop?: boolean;
  /**
   * Text copied to the clipboard by the Copy button.
   * @default lines.join('\n')
   */
  copyText?: string;
  className?: string;
}

/**
 * TerminalWindow
 *
 * A mac-style terminal window (traffic-light dots + title bar) that reveals
 * `lines` one at a time, with a working copy-to-clipboard button. Respects
 * `useMotionPreference` — when animation is disabled, all lines render
 * immediately with no reveal or loop.
 *
 * @example
 * ```tsx
 * <TerminalWindow
 *   title="Terminal — zsh"
 *   lines={['npm install @opencosmos/ui', '✓ installed 1 package']}
 *   loop
 * />
 * ```
 */
export function TerminalWindow({
  title = 'Terminal',
  lines,
  loop = false,
  copyText,
  className,
}: TerminalWindowProps) {
  const { shouldAnimate, scale } = useMotionPreference();
  const [visibleCount, setVisibleCount] = useState(shouldAnimate ? 0 : lines.length);
  const [copied, setCopied] = useState(false);

  const lineDelayMs = shouldAnimate ? 600 / Math.max(scale, 1) : 0;
  const pauseMs = 2200;

  useEffect(() => {
    if (!shouldAnimate) {
      setVisibleCount(lines.length);
      return;
    }

    setVisibleCount(0);
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const revealNext = (index: number) => {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setVisibleCount(index + 1);
        if (index + 1 < lines.length) {
          revealNext(index + 1);
        } else if (loop) {
          timeoutId = setTimeout(() => {
            if (cancelled) return;
            setVisibleCount(0);
            revealNext(0);
          }, pauseMs);
        }
      }, lineDelayMs);
    };

    revealNext(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [lines, loop, shouldAnimate, lineDelayMs]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn(
        'w-full min-w-0 rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] shadow-2xl',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="p-4 font-mono text-sm min-h-[8rem]">
        <AnimatePresence mode="popLayout">
          {lines.slice(0, visibleCount).map((line, index) => (
            <motion.div
              key={`${index}-${line}`}
              initial={shouldAnimate ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldAnimate ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: shouldAnimate ? 0.2 : 0 }}
              className="flex items-start gap-2 text-[var(--color-text-primary)] whitespace-pre-wrap break-words"
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
