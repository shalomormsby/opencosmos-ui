import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sage-interactive [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-1',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow-sm',
                primary: 'bg-primary text-primary-foreground shadow-sm', // Alias for default
                destructive: 'bg-destructive text-destructive-foreground shadow-xs',
                outline: 'border border-input bg-transparent shadow-xs hover:bg-primary hover:text-primary-foreground hover:border-primary',
                secondary: 'bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 text-secondary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground',
                // `hover:text-accent-foreground` alone was a hover text colour with no
                // hover surface under it. accent-foreground is the colour meant to sit ON
                // an accent background, so in any theme where it approaches the page
                // background — Volt Dark has both at #000000 — a ghost button turned
                // invisible under the cursor. It now resolves to a primary outline and
                // primary text, which mirrors `outline` (bordered, fills primary on hover)
                // one step quieter: bare at rest, outlined on hover. The transparent border
                // is carried at rest so hovering never changes the box; with border-box
                // sizing the fixed heights above are unaffected.
                ghost: 'border border-transparent hover:border-primary hover:text-primary',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = (
    {
        ref,
        className,
        variant,
        size,
        asChild = false,
        children,
        ...props
    }: ButtonProps & {
        ref?: React.Ref<HTMLButtonElement>;
    }
) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        >
            {asChild ? (
                children
            ) : (
                <span className="relative z-20 flex items-center justify-center gap-2">
                    {children}
                </span>
            )}
        </Comp>
    )
}

export { Button, buttonVariants };
