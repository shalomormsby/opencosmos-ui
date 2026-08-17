'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
   * Lines to type out sequentially, one character at a time.
   */
  lines: string[];
  /**
   * Loop the reveal — after the last line, pause, clear, and restart.
   * @default false
   */
  loop?: boolean;
  /**
   * Seconds per character while typing.
   * @default 0.025
   */
  speed?: number;
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
 * A mac-style terminal window (traffic-light dots + title bar) that types
 * `lines` out one character at a time, like a real terminal session, with a
 * working copy-to-clipboard button. Respects `useMotionPreference` — when
 * animation is disabled, all lines render immediately with no type-on or
 * loop.
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
  speed = 0.025,
  copyText,
  className,
}: TerminalWindowProps) {
  const { shouldAnimate, scale } = useMotionPreference();
  const [completedCount, setCompletedCount] = useState(shouldAnimate ? 0 : lines.length);
  const [typedText, setTypedText] = useState('');
  const [copied, setCopied] = useState(false);

  const charDelayMs = speed * (scale > 0 ? 5 / scale : 1) * 1000;
  const lineDelayMs = charDelayMs * 12;
  const pauseMs = 2200;

  useEffect(() => {
    if (!shouldAnimate) {
      setCompletedCount(lines.length);
      setTypedText('');
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeLine = (lineIndex: number, charIndex: number) => {
      if (cancelled) return;

      if (lineIndex >= lines.length) {
        if (loop) {
          timeoutId = setTimeout(() => {
            if (cancelled) return;
            setCompletedCount(0);
            setTypedText('');
            typeLine(0, 0);
          }, pauseMs);
        }
        return;
      }

      const line = lines[lineIndex];
      if (charIndex <= line.length) {
        setTypedText(line.slice(0, charIndex));
        timeoutId = setTimeout(() => typeLine(lineIndex, charIndex + 1), charDelayMs);
      } else {
        setCompletedCount(lineIndex + 1);
        setTypedText('');
        timeoutId = setTimeout(() => typeLine(lineIndex + 1, 0), lineDelayMs);
      }
    };

    setCompletedCount(0);
    setTypedText('');
    typeLine(0, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [lines, loop, shouldAnimate, charDelayMs, lineDelayMs]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isTyping = shouldAnimate && completedCount < lines.length;

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
        {lines.slice(0, completedCount).map((line, index) => (
          <div
            key={`${index}-${line}`}
            className="flex items-start gap-2 text-[var(--color-text-primary)] whitespace-pre-wrap break-words"
          >
            {line}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-2 text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
            {typedText}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              className="w-2 h-4 -mb-0.5 bg-[var(--color-primary)] inline-block"
            />
          </div>
        )}
      </div>
    </div>
  );
}
