'use client';

import { useState } from 'react';
import { Card, CollapsibleCodeBlock, Label, Switch, Slider, Backgrounds, type InfinityAnimSize, type InfinityAnimTechnique } from '@opencosmos/ui';

const { InfinityAnim } = Backgrounds;

const INFINITY_CODE = `import { Backgrounds } from '@opencosmos/ui';
const { InfinityAnim } = Backgrounds;

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-6 py-24">
      {/* The hero moment — full bloom + halo */}
      <InfinityAnim size="xl" technique="dashes" />

      <h1 className="text-5xl font-bold tracking-tight">
        Welcome to OpenCosmos
      </h1>
    </div>
  );
}`;

const SIZES: { id: InfinityAnimSize; label: string; note: string }[] = [
  { id: 'xs', label: 'xs',  note: '16px height — inline glyph (e.g. next to thinking text)' },
  { id: 'sm', label: 'sm',  note: '24px height — small accent, list-item leading mark' },
  { id: 'md', label: 'md',  note: '64px height — section accent, card decoration' },
  { id: 'lg', label: 'lg',  note: '128px height — feature panel, with halo' },
  { id: 'xl', label: 'xl',  note: '256px height — hero moment, full bloom + halo' },
];

const TECHNIQUES: { id: InfinityAnimTechnique; label: string; description: string }[] = [
  { id: 'stripes', label: 'Stripes', description: 'Perpendicular line stripes traveling on offset-path. Rich detail at md+, visibly discrete at xs / sm.' },
  { id: 'dashes',  label: 'Dashes',  description: 'Three stacked stroke-dasharray paths sharing one head position. Continuous at every size, more elegant inline.' },
];

export function InfinityAnimPage() {
  const [size, setSize] = useState<InfinityAnimSize>('lg');
  const [technique, setTechnique] = useState<InfinityAnimTechnique>('dashes');
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-[var(--color-text-primary)]">
          Infinity
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          The OpenCosmos brand mark — two streams sweeping a lemniscate (∞)
          path. Five pre-tuned sizes from a 16 px inline glyph to a 256 px hero
          moment. Two render techniques: <strong>stripes</strong> (rich at large
          sizes) and <strong>dashes</strong> (elegant at every size).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-black p-8 flex items-center justify-center min-h-[360px] border-[var(--color-border)]">
            <InfinityAnim size={size} technique={technique} paused={paused} duration={duration} />
          </Card>

          {/* Comparison: every size, both techniques stacked vertically */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
              All sizes, both techniques
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              For each size: stripes on top, dashes below. Same palette and duration.
            </p>

            <Card className="bg-black p-8 border-[var(--color-border)]">
              <div className="space-y-12">
                {SIZES.map((s) => (
                  <section key={s.id} className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">
                      {s.label}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="w-16 shrink-0 text-[10px] font-mono uppercase tracking-wider text-white/40">
                        stripes
                      </span>
                      <InfinityAnim size={s.id} technique="stripes" />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-16 shrink-0 text-[10px] font-mono uppercase tracking-wider text-white/40">
                        dashes
                      </span>
                      <InfinityAnim size={s.id} technique="dashes" />
                    </div>
                  </section>
                ))}
              </div>
            </Card>

            <div className="mt-6 space-y-2">
              {SIZES.map((s) => (
                <p key={s.id} className="text-xs text-[var(--color-text-secondary)]">
                  <span className="font-mono mr-2">{s.label}</span>{s.note}
                </p>
              ))}
            </div>
          </div>

          <CollapsibleCodeBlock code={INFINITY_CODE} language="tsx" />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Controls
            </h2>

            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSize(s.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                      size === s.id
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Technique</Label>
              <div className="flex gap-2 flex-wrap">
                {TECHNIQUES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTechnique(t.id)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      technique === t.id
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {TECHNIQUES.find((t) => t.id === technique)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="infinity-paused">Paused</Label>
                <Switch id="infinity-paused" checked={paused} onCheckedChange={setPaused} />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Renders the brand mark as a static still — same image as motion intensity 0.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Speed (cycle duration)</Label>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {duration.toFixed(1)}s
                </span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={([v]) => setDuration(v)}
                min={1}
                max={60}
                step={0.5}
              />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Higher = slower orbit. Low values feel kinetic; high values (20s+) feel meditative.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-primary)]">
              Theme-aware
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Default palette is derived from <code className="font-mono">OrbBackground</code>:
              deep blue <code className="font-mono">#101499</code>, purple{' '}
              <code className="font-mono">#9c43fe</code>, cyan{' '}
              <code className="font-mono">#4cc2e9</code>. Override per-instance via the{' '}
              <code className="font-mono">colorTail</code> /{' '}
              <code className="font-mono">colorBody</code> /{' '}
              <code className="font-mono">colorHead</code> props.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
