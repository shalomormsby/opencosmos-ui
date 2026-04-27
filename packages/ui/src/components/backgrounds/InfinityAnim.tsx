'use client';

import * as React from 'react';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { cn } from '../../lib/utils';

/* ── The lemniscate ──────────────────────────────────────────────────────
 * A single closed cubic-bezier path tracing an infinity symbol. All sizes
 * and techniques share this path.
 */
const COMET_PATH =
  'M 410,250 C 410,291.9 358.3,312.6 325.4,303.3 C 292.5,294 270.9,270.9 250,250 ' +
  'C 229.1,229.1 207.5,206 174.6,196.7 C 141.7,187.4 90,208.1 90,250 ' +
  'C 90,291.9 141.7,312.6 174.6,303.3 C 207.5,294 229.1,270.9 250,250 ' +
  'C 270.9,229.1 292.5,206 325.4,196.7 C 358.3,187.4 410,208.1 410,250 Z';

/** Cropped viewBox: the lemniscate's bounding box plus padding for bloom + halo. */
const VB = { x: 60, y: 175, w: 380, h: 150 } as const;
const ASPECT = VB.w / VB.h;

/** Comet body length as a fraction of the path. */
const TAIL_FRACTION = 0.6;

/** Normalised path length used for dash arithmetic. The actual path is rescaled to this. */
const PATH_LENGTH = 1000;

/* ── Default palette — derived from OrbBackground ───────────────────────
 * Same chromatic mood as the Orb: deep blue (cool, recessive) → purple
 * (the brand body) → cyan (bright pop where the bloom lives).
 */
const DEFAULT_PALETTE = {
  tail: '#101499', // deep blue
  body: '#9c43fe', // purple
  head: '#4cc2e9', // cyan
} as const;

export type InfinityAnimSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type InfinityAnimTechnique = 'stripes' | 'dashes';

interface SizeConfig {
  /** Rendered height in pixels. Width is height × aspect ratio (≈ 2.5). */
  heightPx: number;
  /** Number of body stripes — only used by the `stripes` technique. */
  stripes: number;
  /** Maximum stroke width at the head, in viewBox units (path is in 500-unit space). */
  headStroke: number;
  /** Gaussian blur stdDeviation. 0 disables bloom. */
  bloomStdDev: number;
  /** Render leading halo lines around the head — `stripes` only. */
  halo: boolean;
  /** Animation duration in seconds. */
  duration: number;
}

const SIZE_CONFIGS: Record<InfinityAnimSize, SizeConfig> = {
  xs: { heightPx: 16,  stripes: 8,  headStroke: 14, bloomStdDev: 0,    halo: false, duration: 3 },
  sm: { heightPx: 24,  stripes: 14, headStroke: 12, bloomStdDev: 1.8,  halo: false, duration: 3 },
  md: { heightPx: 64,  stripes: 30, headStroke: 8,  bloomStdDev: 5,    halo: false, duration: 3 },
  lg: { heightPx: 128, stripes: 50, headStroke: 6,  bloomStdDev: 10,   halo: true,  duration: 3 },
  xl: { heightPx: 256, stripes: 80, headStroke: 5,  bloomStdDev: 18,   halo: true,  duration: 3 },
};

/* ── Color interpolation (3-stop gradient) ───────────────────────────── */

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbStr({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

/** 3-stop gradient: tail (t=0) → body (t=0.5) → head (t=1). */
function gradientAt(t: number, tail: RGB, body: RGB, head: RGB): RGB {
  if (t <= 0.5) return lerpRgb(tail, body, t * 2);
  return lerpRgb(body, head, (t - 0.5) * 2);
}

/* ── Stripe technique ───────────────────────────────────────────────── */

interface Stripe {
  yExtent: number;
  width: number;
  opacity: number;
  color: string;
  delay: number;
  staticOffsetPct: number;
  bloom: boolean;
}

function generateStripes(cfg: SizeConfig, tail: RGB, body: RGB, head: RGB): Stripe[] {
  const N = cfg.stripes;
  const stripes: Stripe[] = [];
  for (let i = 0; i < N; i++) {
    const t = N === 1 ? 1 : i / (N - 1);
    const yExtent = 0.4 + Math.pow(t, 1.5) * cfg.headStroke * 1.7;
    const width = 0.8 + t * cfg.headStroke * 0.5;
    const opacity = 0.06 + Math.pow(t, 1.2) * 0.94;
    const color = rgbStr(gradientAt(t, tail, body, head));
    const bloom = cfg.bloomStdDev > 0 && t > 0.75;
    const delay = -t * cfg.duration * TAIL_FRACTION;
    const staticOffsetPct = t * TAIL_FRACTION * 100;
    stripes.push({ yExtent, width, opacity, color, delay, staticOffsetPct, bloom });
  }
  return stripes;
}

function generateHalo(cfg: SizeConfig, head: RGB): Stripe[] {
  const headDelay = -cfg.duration * TAIL_FRACTION;
  const headOffset = TAIL_FRACTION * 100;
  return [0, 1, 2].map((i) => ({
    yExtent: cfg.headStroke * (2.0 + i * 0.6),
    width: cfg.headStroke * (1.3 + i * 0.3),
    opacity: 0.32 - i * 0.08,
    color: rgbStr(head),
    delay: headDelay + i * 0.02,
    staticOffsetPct: Math.max(0, headOffset - i * 0.5),
    bloom: true,
  }));
}

/* ── Dashes technique ───────────────────────────────────────────────── */

interface DashLayer {
  color: string;
  opacity: number;
  width: number;
  dashLen: number;
  /** stroke-dashoffset value when paused / at animation start. */
  startOffset: number;
  /** Gaussian blur stdDeviation, in viewBox units. 0 disables filter. */
  blur: number;
}

/**
 * Preset color combinations for the dashes technique. The two strokes —
 * which sit on opposite lobes of the lemniscate — read as equally-weighted
 * sibling streams, so picking matching colors gives a uniform mark and
 * picking different colors gives the brand "pink + blue" double-stream feel.
 */
export type InfinityAnimPalette =
  | 'pink-blue'
  | 'pink-pink'
  | 'blue-blue'
  | 'pink-white'
  | 'blue-white'
  | 'white-white';

const DASH_PINK = '#ec4899';
const DASH_BLUE = '#3b82f6';
const DASH_WHITE = '#FFFFFF';

const PALETTE_COLORS: Record<InfinityAnimPalette, [string, string]> = {
  'pink-blue':   [DASH_PINK,  DASH_BLUE],
  'pink-pink':   [DASH_PINK,  DASH_PINK],
  'blue-blue':   [DASH_BLUE,  DASH_BLUE],
  'pink-white':  [DASH_PINK,  DASH_WHITE],
  'blue-white':  [DASH_BLUE,  DASH_WHITE],
  'white-white': [DASH_WHITE, DASH_WHITE],
};

/**
 * Two equal-length, equal-character dashes sharing the lemniscate. Each
 * stream sits on an opposite lobe of the infinity (`startOffset` shifted by
 * HALF_PATH). They sweep in sync — twin sibling comets chasing each other.
 */
function generateDashLayers(cfg: SizeConfig, palette: InfinityAnimPalette): DashLayer[] {
  const TAIL_LEN = TAIL_FRACTION * PATH_LENGTH;
  const HEAD_POS = TAIL_LEN;
  const DASH_LEN = TAIL_LEN * 0.61875;
  const HALF_PATH = PATH_LENGTH / 2;

  const [colorA, colorB] = PALETTE_COLORS[palette];
  const baseStroke = {
    width: cfg.headStroke * 0.7,
    opacity: 1.0,
    blur: cfg.bloomStdDev > 0 ? cfg.bloomStdDev * 0.5 : 0,
    dashLen: DASH_LEN,
  };

  return [
    {
      ...baseStroke,
      color: colorA,
      startOffset: HEAD_POS - baseStroke.dashLen + HALF_PATH,
    },
    {
      ...baseStroke,
      color: colorB,
      startOffset: HEAD_POS - baseStroke.dashLen,
    },
  ];
}

/* ── Component ───────────────────────────────────────────────────────── */

export interface InfinityAnimProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  /**
   * Pre-tuned size variant. Each tier optimises stripe count, bloom intensity,
   * and halo on/off for legibility and weight at that scale.
   * @default 'md'
   */
  size?: InfinityAnimSize;
  /**
   * Render technique. `stripes` uses N perpendicular line stripes (rich detail
   * at md / lg / xl, but visibly discrete at xs / sm). `dashes` uses three
   * stacked stroke-dasharray paths (continuous at every size, more elegant
   * for inline glyphs).
   * @default 'stripes'
   */
  technique?: InfinityAnimTechnique;
  /** Override animation duration in seconds. @default 3 */
  duration?: number;
  /** Pause the orbit. Renders a static comet at rest. */
  paused?: boolean;
  /** Optional accessible label. Omit to mark as decorative. */
  label?: string;
  /** Tail-end color (hex), `stripes` technique only. Default: deep blue from the Orb palette. */
  colorTail?: string;
  /** Body / mid-comet color (hex), `stripes` technique only. Default: brand purple. */
  colorBody?: string;
  /** Head color (hex), `stripes` technique only. Default: cyan. Bloom uses this. */
  colorHead?: string;
  /** Override the infinity track tint. Defaults to body color at low opacity. */
  colorTrack?: string;
  /**
   * Color combination for the `dashes` technique. Two strokes sit on opposite
   * lobes of the lemniscate; this picks both at once. Ignored by `stripes`.
   * @default 'pink-blue'
   */
  palette?: InfinityAnimPalette;
  /**
   * Smart speed control for the `dashes` technique. Three velocity tiers
   * with smooth exponential easing (~600ms time constant) between them:
   *
   * - `false` — idle drift at 25% of full speed (never fully stops)
   * - `true`  — boosted to 133% of full speed (energised during activity)
   * - `undefined` — full speed, runs continuously (backward-compatible)
   *
   * Useful for sympathetic motion — e.g., pairing the mark with a typewriter
   * effect so the orbit surges while text writes on and settles to a gentle
   * ambient drift between phrases. Ignored by `stripes`.
   */
  runWhile?: boolean;
}

/**
 * InfinityAnim — the OpenCosmos brand mark.
 *
 * A glowing comet sweeping a lemniscate (∞) path with a 3-stop chromatic
 * gradient (deep-blue tail → purple body → cyan head) inside a thick pale
 * track. Five pre-tuned sizes; two render techniques.
 */
export function InfinityAnim({
  size = 'md',
  technique = 'stripes',
  duration: durationOverride,
  paused = false,
  label,
  colorTail = DEFAULT_PALETTE.tail,
  colorBody = DEFAULT_PALETTE.body,
  colorHead = DEFAULT_PALETTE.head,
  colorTrack,
  palette = 'pink-blue',
  runWhile,
  className,
  style,
  ...rest
}: InfinityAnimProps) {
  const { shouldAnimate } = useMotionPreference();

  const cfg = React.useMemo<SizeConfig>(() => {
    const base = SIZE_CONFIGS[size];
    return durationOverride !== undefined ? { ...base, duration: durationOverride } : base;
  }, [size, durationOverride]);

  const stripePalette = React.useMemo(
    () => ({ tail: hexToRgb(colorTail), body: hexToRgb(colorBody), head: hexToRgb(colorHead) }),
    [colorTail, colorBody, colorHead],
  );

  const isAnimating = shouldAnimate && !paused;
  const rawId = React.useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '_');

  // Track stroke matches the head's perpendicular extent so the comet
  // appears to run *inside* the track.
  const trackStroke = 2 * (0.4 + cfg.headStroke * 1.7);
  const resolvedTrack = colorTrack ?? colorBody;

  return (
    <svg
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid meet"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(className)}
      style={{
        height: cfg.heightPx,
        width: cfg.heightPx * ASPECT,
        overflow: 'visible',
        ...style,
      }}
      {...rest}
    >
      {/* Thick infinity track — the comet runs inside it */}
      <path
        d={COMET_PATH}
        fill="none"
        stroke={resolvedTrack}
        strokeWidth={trackStroke}
        strokeOpacity={0.07}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {technique === 'stripes' ? (
        <StripesLayer cfg={cfg} palette={stripePalette} uid={uid} isAnimating={isAnimating} />
      ) : (
        <DashesLayer
          cfg={cfg}
          palette={palette}
          uid={uid}
          isAnimating={isAnimating}
          runWhile={runWhile}
        />
      )}
    </svg>
  );
}

/* ── Render: Stripes ─────────────────────────────────────────────────── */

interface StripesLayerProps {
  cfg: SizeConfig;
  palette: { tail: RGB; body: RGB; head: RGB };
  uid: string;
  isAnimating: boolean;
}

function StripesLayer({ cfg, palette, uid, isAnimating }: StripesLayerProps) {
  const animName = `infinityAnimOrbit_${uid}`;
  const stripeClass = `infinityAnimStripe_${uid}`;
  const bloomFilterId = `infinityAnimBloom_${uid}`;
  const haloFilterId = `infinityAnimHalo_${uid}`;

  const body = React.useMemo(
    () => generateStripes(cfg, palette.tail, palette.body, palette.head),
    [cfg, palette],
  );
  const halo = React.useMemo(
    () => (cfg.halo ? generateHalo(cfg, palette.head) : []),
    [cfg, palette],
  );

  const cssBlock = `
    .${stripeClass} {
      offset-path: path("${COMET_PATH}");
      offset-rotate: auto;
      ${isAnimating ? `animation: ${animName} ${cfg.duration}s linear infinite;` : ''}
    }
    ${
      isAnimating
        ? `@keyframes ${animName} { from { offset-distance: 0%; } to { offset-distance: 100%; } }`
        : ''
    }
    @media (prefers-reduced-motion: reduce) {
      .${stripeClass} { animation: none !important; }
    }
  `;

  const stripeStyle = (s: Stripe): React.CSSProperties =>
    isAnimating
      ? { animationDelay: `${s.delay}s` }
      : ({ offsetDistance: `${s.staticOffsetPct}%` } as React.CSSProperties);

  return (
    <>
      <defs>
        {cfg.bloomStdDev > 0 && (
          <filter id={bloomFilterId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={cfg.bloomStdDev} result="b1" />
            <feGaussianBlur stdDeviation={cfg.bloomStdDev * 2.5} result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        {cfg.halo && (
          <filter id={haloFilterId} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation={Math.max(cfg.bloomStdDev * 3, 20)} />
          </filter>
        )}
        <style>{cssBlock}</style>
      </defs>

      {halo.map((s, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={-s.yExtent}
          x2={0}
          y2={s.yExtent}
          stroke={s.color}
          strokeWidth={s.width}
          strokeOpacity={s.opacity}
          strokeLinecap="round"
          className={stripeClass}
          filter={`url(#${haloFilterId})`}
          style={stripeStyle(s)}
        />
      ))}

      {body.map((s, i) => (
        <line
          key={`s-${i}`}
          x1={0}
          y1={-s.yExtent}
          x2={0}
          y2={s.yExtent}
          stroke={s.color}
          strokeWidth={s.width}
          strokeOpacity={s.opacity}
          strokeLinecap="round"
          className={stripeClass}
          filter={s.bloom ? `url(#${bloomFilterId})` : undefined}
          style={stripeStyle(s)}
        />
      ))}
    </>
  );
}

/* ── Render: Dashes ──────────────────────────────────────────────────── */

interface DashesLayerProps {
  cfg: SizeConfig;
  palette: InfinityAnimPalette;
  uid: string;
  isAnimating: boolean;
  runWhile?: boolean;
}

/**
 * The dashes technique runs on a JS rAF loop instead of CSS keyframes so we
 * can pause/resume mid-animation without teleporting and ease velocity in
 * and out smoothly. A single shared `progress` counter (units along the
 * normalised path) drives both layers' `stroke-dashoffset` via direct DOM
 * mutation — no React re-renders per frame.
 *
 * When `runWhile` is undefined (default) the orbit runs continuously. When
 * set, velocity is exponentially eased toward target_speed (full speed when
 * `runWhile === true`, zero when `runWhile === false`).
 */
function DashesLayer({ cfg, palette, uid, isAnimating, runWhile }: DashesLayerProps) {
  const layers = React.useMemo(() => generateDashLayers(cfg, palette), [cfg, palette]);
  const filterPrefix = `infinityAnimDashBloom_${uid}`;

  const pathRefs = React.useRef<Array<SVGPathElement | null>>([]);

  // Refs so we don't restart the rAF effect on every prop change. The loop
  // reads the latest values without needing to be re-subscribed.
  const runWhileRef = React.useRef(runWhile);
  const targetSpeedRef = React.useRef(0);
  React.useEffect(() => {
    runWhileRef.current = runWhile;
  }, [runWhile]);
  React.useEffect(() => {
    // Three velocity tiers with smooth exponential easing between them.
    // undefined = always-on at full speed (back-compat).
    // true      = boosted (+33%) — visible energy during active phases.
    // false     = idle drift (25%) — ambient, never fully stops.
    const fullSpeed = PATH_LENGTH / cfg.duration;
    if (runWhile === undefined) {
      targetSpeedRef.current = fullSpeed;
    } else if (runWhile) {
      targetSpeedRef.current = fullSpeed * 1.33;
    } else {
      targetSpeedRef.current = fullSpeed * 0.25;
    }
  }, [runWhile, cfg.duration]);

  React.useEffect(() => {
    if (!isAnimating) return;

    let raf = 0;
    let last = performance.now();
    // Start at the correct tier so the first frame isn't a jarring jump.
    const fullSpeed = PATH_LENGTH / cfg.duration;
    let velocity =
      runWhileRef.current === false
        ? fullSpeed * 0.25
        : runWhileRef.current === true
          ? fullSpeed * 1.33
          : fullSpeed;
    let progress = 0;

    // Exponential ease toward target velocity. 0.06 per 60fps frame ≈ 600ms
    // time constant — feels natural for a meditative orbit.
    const EASE_PER_FRAME = 0.06;
    const FRAME_RATE = 1 / 60;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = targetSpeedRef.current;
      // Scale easing by dt so behaviour is consistent across refresh rates.
      const ease = 1 - Math.pow(1 - EASE_PER_FRAME, dt / FRAME_RATE);
      velocity += (target - velocity) * ease;

      progress = (progress + velocity * dt) % PATH_LENGTH;
      if (progress < 0) progress += PATH_LENGTH;

      // Mutate DOM directly — single source of truth, no React renders.
      for (let i = 0; i < layers.length; i++) {
        const path = pathRefs.current[i];
        if (path) path.setAttribute('stroke-dashoffset', String(layers[i].startOffset - progress));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isAnimating, layers, cfg.duration]);

  return (
    <>
      <defs>
        {layers.map((l, i) =>
          l.blur > 0 ? (
            <filter
              key={`f-${i}`}
              id={`${filterPrefix}_${i}`}
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation={l.blur} result="b1" />
              <feGaussianBlur stdDeviation={l.blur * 2.5} result="b2" />
              <feMerge>
                <feMergeNode in="b2" />
                <feMergeNode in="b1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ) : null,
        )}
      </defs>

      {layers.map((l, i) => (
        <path
          key={`d-${i}`}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={COMET_PATH}
          pathLength={PATH_LENGTH}
          fill="none"
          stroke={l.color}
          strokeWidth={l.width}
          strokeOpacity={l.opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${l.dashLen} ${PATH_LENGTH - l.dashLen}`}
          strokeDashoffset={l.startOffset}
          filter={l.blur > 0 ? `url(#${filterPrefix}_${i})` : undefined}
        />
      ))}
    </>
  );
}
