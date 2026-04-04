'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useMotionPreference } from '../../hooks/useMotionPreference';
import { PanelLeftClose } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'appsidebar:state';
export const APP_SIDEBAR_WIDTH = 280;
export const APP_SIDEBAR_WIDTH_COLLAPSED = 60;

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
}

export function AppSidebarProvider({ children, defaultOpen = true }: AppSidebarProviderProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) setIsOpen(stored === 'true');
    }, []);

    const persist = (value: boolean) => localStorage.setItem(STORAGE_KEY, String(value));

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
    const { shouldAnimate, scale } = useMotionPreference();
    const duration = shouldAnimate ? Math.round(300 * (5 / Math.max(scale, 0.1))) : 0;

    return (
        <div
            className={cn('min-h-screen', className)}
            style={{
                marginLeft: isOpen ? APP_SIDEBAR_WIDTH : APP_SIDEBAR_WIDTH_COLLAPSED,
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
    /** Navigation items */
    items?: AppSidebarNavItem[];
    /** Body slot — rendered in the scrollable mid-section (e.g. conversation history). Only visible when expanded. */
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
    children,
    footer,
    className,
}: AppSidebarProps) {
    const { isOpen, toggle } = useAppSidebar();
    const { shouldAnimate, scale } = useMotionPreference();
    const duration = shouldAnimate ? Math.round(300 * (5 / Math.max(scale, 0.1))) : 0;

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 bottom-0 z-40 flex flex-col',
                'bg-background border-r border-foreground/8 overflow-hidden',
                className
            )}
            style={{
                width: isOpen ? APP_SIDEBAR_WIDTH : APP_SIDEBAR_WIDTH_COLLAPSED,
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
                <nav className="px-2 py-2 space-y-0.5 shrink-0" aria-label="Main navigation">
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
                                    ? 'gap-3 px-3 py-2.5'
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

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            {footer && (
                <div
                    className={cn(
                        'shrink-0 border-t border-foreground/8',
                        isOpen ? 'p-3' : 'px-2 py-3 flex justify-center'
                    )}
                >
                    {footer}
                </div>
            )}
        </aside>
    );
}
