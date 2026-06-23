'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { PanelLeftClose } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'appsidebar:state';
export const APP_SIDEBAR_WIDTH = 280;
export const APP_SIDEBAR_WIDTH_COLLAPSED = 60;
/**
 * Below this viewport width the sidebar switches from a "push" layout (content
 * offset by the sidebar width) to an "overlay" layout (sidebar floats above
 * content over a scrim). Pushing a 280px sidebar on a ~360px phone squeezes the
 * content into an unusable sliver — the overlay keeps the full viewport for
 * content and lets the sidebar slide over it instead. Exported so consumers that
 * position chrome relative to the sidebar (e.g. a fixed bottom bar) can match.
 */
export const APP_SIDEBAR_MOBILE_BREAKPOINT = 768;
/**
 * Width of the open sidebar in overlay (mobile) mode. Leaves a strip of scrim
 * visible so the user can always tap outside to dismiss, and never exceeds a
 * comfortable reading width.
 */
export const APP_SIDEBAR_WIDTH_MOBILE = 'min(85vw, 320px)';

// ── useIsMobile ─────────────────────────────────────────────────────────────────

/**
 * True when the viewport is narrower than {@link APP_SIDEBAR_MOBILE_BREAKPOINT}.
 *
 * SSR-safe: defaults to `false` (desktop/push layout) so server and first client
 * render agree, then corrects after mount. Exported so consumers can mirror the
 * sidebar's responsive switch for their own fixed chrome.
 */
export function useIsMobile(breakpoint: number = APP_SIDEBAR_MOBILE_BREAKPOINT): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, [breakpoint]);

    return isMobile;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppSidebarContextValue {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

const AppSidebarContext = createContext<AppSidebarContextValue | null>(null);

// Safe default used when no provider is in scope.
//
// WHY this exists — do not change back to a throw:
//
// `next.config.mjs` sets `transpilePackages: ['@opencosmos/ui']`, which tells
// Next.js/webpack to bundle this package from SOURCE instead of dist. Webpack can
// then split this file and its consumer (e.g. the docs playground) into separate
// chunks. Each chunk gets its own module execution scope, so `createContext()` can
// run twice — producing two distinct AppSidebarContext objects. The Provider writes
// to instance A; AppSidebar reads from instance B → useContext returns null even
// though a Provider is present in the React tree.
//
// Throwing on null ctx (the common pattern) causes the entire page to 500.
// Returning a safe default lets the component render correctly in isolation.
// Consuming apps should still wrap with AppSidebarProvider for state persistence.
const DEFAULT_CONTEXT: AppSidebarContextValue = {
    isOpen: true,
    toggle: () => {},
    open: () => {},
    close: () => {},
};

export function useAppSidebar(): AppSidebarContextValue {
    return useContext(AppSidebarContext) ?? DEFAULT_CONTEXT;
}

// ── AppSidebarProvider ────────────────────────────────────────────────────────

export interface AppSidebarProviderProps {
    children: React.ReactNode;
    /** Initial open state used on server and first render @default true */
    defaultOpen?: boolean;
    /** localStorage key for persisting open state. Use unique keys per page to avoid cross-page state bleed. @default 'appsidebar:state' */
    storageKey?: string;
}

export function AppSidebarProvider({ children, defaultOpen = true, storageKey = STORAGE_KEY }: AppSidebarProviderProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) setIsOpen(stored === 'true');
    }, [storageKey]);

    const persist = (value: boolean) => localStorage.setItem(storageKey, String(value));

    const toggle = () => setIsOpen(prev => { const next = !prev; persist(next); return next; });
    const open   = () => { setIsOpen(true);  persist(true);  };
    const close  = () => { setIsOpen(false); persist(false); };

    return (
        <AppSidebarContext.Provider value={{ isOpen, toggle, open, close }}>
            {children}
        </AppSidebarContext.Provider>
    );
}

// ── AppSidebarInset ───────────────────────────────────────────────────────────

export function AppSidebarInset({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { isOpen } = useAppSidebar();
    const isMobile = useIsMobile();
    const { shouldAnimate, scale } = useMotionPreference();
    const duration = shouldAnimate ? Math.round(300 * (5 / Math.max(scale, 0.1))) : 0;

    // On mobile the open sidebar overlays the content (see AppSidebar), so the
    // inset is never pushed beyond the collapsed rail — this is what prevents the
    // content from being squeezed into a sliver on narrow viewports.
    const marginLeft = isMobile
        ? APP_SIDEBAR_WIDTH_COLLAPSED
        : isOpen
          ? APP_SIDEBAR_WIDTH
          : APP_SIDEBAR_WIDTH_COLLAPSED;

    return (
        <div
            className={cn('min-h-screen', className)}
            style={{
                marginLeft,
                transition: shouldAnimate ? `margin-left ${duration}ms ease-out` : 'none',
            }}
        >
            {children}
        </div>
    );
}

// ── Nav item type ─────────────────────────────────────────────────────────────

export interface AppSidebarNavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
    external?: boolean;
}

// ── AppSidebar ────────────────────────────────────────────────────────────────

export interface AppSidebarProps {
    /** Icon element always visible (32×32). Clicking it toggles open/closed. */
    logo?: React.ReactNode;
    /** Wordmark shown next to the logo when expanded */
    title?: string;
    /** Navigation items rendered at the top (below the header) */
    items?: AppSidebarNavItem[];
    /** Navigation items rendered at the bottom (above the footer) */
    bottomItems?: AppSidebarNavItem[];
    /** Body slot — rendered in the flex-1 mid-section (e.g. conversation history). Only visible when expanded. */
    children?: React.ReactNode;
    /** Footer slot — auth section, user avatar, sign-in prompt, etc. */
    footer?: React.ReactNode;
    /** Additional className for the <aside> */
    className?: string;
}

export function AppSidebar({
    logo,
    title,
    items = [],
    bottomItems = [],
    children,
    footer,
    className,
}: AppSidebarProps) {
    const { isOpen, toggle, close } = useAppSidebar();
    const isMobile = useIsMobile();
    const { shouldAnimate, scale } = useMotionPreference();
    const duration = shouldAnimate ? Math.round(300 * (5 / Math.max(scale, 0.1))) : 0;

    // In overlay mode the sidebar floats above content; closing it on Escape and
    // on backdrop tap matches the standard mobile-drawer affordance.
    const overlayOpen = isMobile && isOpen;
    useEffect(() => {
        if (!overlayOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [overlayOpen, close]);

    // Overlay open → cap to a comfortable reading width with a scrim strip
    // visible. Otherwise the desktop push widths (full / rail) are unchanged.
    const width = isMobile
        ? isOpen
            ? APP_SIDEBAR_WIDTH_MOBILE
            : APP_SIDEBAR_WIDTH_COLLAPSED
        : isOpen
          ? APP_SIDEBAR_WIDTH
          : APP_SIDEBAR_WIDTH_COLLAPSED;

    return (
        <>
            {/* Backdrop scrim — only present in overlay mode while open. Tap to
                dismiss. Sits below the sidebar (z-40) but above page content. */}
            {overlayOpen && (
                <div
                    aria-hidden="true"
                    onClick={toggle}
                    className="fixed inset-0 z-40 bg-black/50"
                    style={{ transition: shouldAnimate ? `opacity ${duration}ms ease-out` : 'none' }}
                />
            )}
            <aside
                className={cn(
                    'fixed left-0 top-0 bottom-0 flex flex-col',
                    'bg-background border-r border-foreground/8 overflow-hidden',
                    // Raise above the scrim (and any sticky page header) when
                    // overlaying; otherwise keep the original stacking level.
                    overlayOpen ? 'z-50' : 'z-40',
                    className
                )}
                style={{
                    width,
                    transition: shouldAnimate ? `width ${duration}ms ease-out` : 'none',
                }}
            >
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex items-center h-16 px-[10px] shrink-0">
                {/* Logo + wordmark — clicking toggles in both states */}
                <button
                    onClick={toggle}
                    className={cn(
                        'flex items-center gap-2.5 flex-1 min-w-0',
                        'rounded-lg p-1.5',
                        'hover:bg-foreground/5 transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]'
                    )}
                    aria-label={isOpen ? (title ?? 'OpenCosmos') : 'Expand sidebar'}
                >
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center">
                        {logo}
                    </span>
                    <span
                        className="font-semibold text-sm text-foreground whitespace-nowrap"
                        style={{
                            opacity: isOpen ? 1 : 0,
                            width: isOpen ? 'auto' : 0,
                            overflow: 'hidden',
                            pointerEvents: isOpen ? 'auto' : 'none',
                            transition: shouldAnimate
                                ? `opacity ${Math.round(duration * 0.6)}ms ease-out`
                                : 'none',
                        }}
                    >
                        {title}
                    </span>
                </button>

                {/* Collapse icon — only shown/accessible when open */}
                <button
                    onClick={toggle}
                    tabIndex={isOpen ? 0 : -1}
                    className={cn(
                        'shrink-0 w-8 h-8 flex items-center justify-center rounded-lg',
                        'text-foreground/35 hover:text-foreground/65 hover:bg-foreground/5',
                        'transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]'
                    )}
                    style={{
                        opacity: isOpen ? 1 : 0,
                        pointerEvents: isOpen ? 'auto' : 'none',
                        transition: shouldAnimate
                            ? `opacity ${Math.round(duration * 0.5)}ms ease-out`
                            : 'none',
                    }}
                    aria-label="Collapse sidebar"
                >
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>

            {/* ── Nav items ──────────────────────────────────────────────────── */}
            {items.length > 0 && (
                <nav className="px-2 py-2 space-y-1 shrink-0" aria-label="Main navigation">
                    {items.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            title={!isOpen ? item.label : undefined}
                            aria-label={!isOpen ? item.label : undefined}
                            className={cn(
                                'flex items-center rounded-lg transition-colors duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
                                isOpen
                                    ? 'gap-3 px-3 py-3'
                                    : 'justify-center w-9 h-9 mx-auto',
                                item.active
                                    ? 'bg-foreground/8 text-foreground font-medium'
                                    : 'text-[var(--color-text-secondary)] hover:bg-foreground/5 hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            <span className="shrink-0 flex items-center justify-center w-4 h-4">
                                {item.icon}
                            </span>
                            <span
                                className="text-sm whitespace-nowrap"
                                style={{
                                    opacity: isOpen ? 1 : 0,
                                    width: isOpen ? 'auto' : 0,
                                    overflow: 'hidden',
                                    pointerEvents: isOpen ? 'auto' : 'none',
                                    transition: shouldAnimate
                                        ? `opacity ${Math.round(duration * 0.55)}ms ease-out`
                                        : 'none',
                                }}
                            >
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>
            )}

            {/* ── Body (conversation history, etc.) ──────────────────────────── */}
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
                style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
            >
                {children}
            </div>

            {/* ── Bottom nav items ───────────────────────────────────────────── */}
            {bottomItems.length > 0 && (
                <nav className="px-2 py-2 space-y-1 shrink-0 border-t border-foreground/8" aria-label="Bottom navigation">
                    {bottomItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            title={!isOpen ? item.label : undefined}
                            aria-label={!isOpen ? item.label : undefined}
                            className={cn(
                                'flex items-center rounded-lg transition-colors duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]',
                                isOpen
                                    ? 'gap-3 px-3 py-3'
                                    : 'justify-center w-9 h-9 mx-auto',
                                item.active
                                    ? 'bg-foreground/8 text-foreground font-medium'
                                    : 'text-[var(--color-text-secondary)] hover:bg-foreground/5 hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            <span className="shrink-0 flex items-center justify-center w-4 h-4">
                                {item.icon}
                            </span>
                            <span
                                className="text-sm whitespace-nowrap"
                                style={{
                                    opacity: isOpen ? 1 : 0,
                                    width: isOpen ? 'auto' : 0,
                                    overflow: 'hidden',
                                    pointerEvents: isOpen ? 'auto' : 'none',
                                    transition: shouldAnimate
                                        ? `opacity ${Math.round(duration * 0.55)}ms ease-out`
                                        : 'none',
                                }}
                            >
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>
            )}

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            {footer && (
                <div
                    className={cn(
                        'shrink-0 border-t border-foreground/8',
                        isOpen ? 'px-4 py-4 space-y-3' : 'px-2 py-3 flex justify-center'
                    )}
                >
                    {footer}
                </div>
            )}
            </aside>
        </>
    );
}
