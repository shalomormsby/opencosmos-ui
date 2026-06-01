import React from 'react';
import {
    type ResponsiveValue,
    gridColsClasses,
    gapClasses,
    colSpanClasses,
    rowSpanClasses,
    colStartClasses,
} from '../../lib/responsive-classes';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    /**
     * Number of columns. Supports responsive object.
     * @example columns={3} or columns={{ base: 1, md: 3 }}
     */
    columns?: ResponsiveValue<number>;
    /**
     * Gap between items. Supports responsive object.
     * Maps to Tailwind gap scale.
     */
    gap?: ResponsiveValue<number>;
    /**
     * HTML element to render as
     */
    as?: any;
}

export const Grid = (
    {
        ref,
        children,
        columns = 1,
        gap = 4,
        as: Component = 'div',
        className = '',
        ...props
    }: GridProps & {
        ref?: React.Ref<HTMLDivElement>;
    }
) => {
    // Class names come from static literal maps (see ../../lib/responsive-classes).
    // NEVER interpolate Tailwind classes here — the scanner can't see runtime-built
    // utility names, so they would silently never be generated.
    const colClasses = gridColsClasses(columns);
    const gapCls = gapClasses(gap);

    return (
        <Component
            ref={ref}
            className={`grid ${colClasses} ${gapCls} ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
};

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    colSpan?: ResponsiveValue<number>;
    rowSpan?: ResponsiveValue<number>;
    colStart?: ResponsiveValue<number>;
    as?: any;
}

export const GridItem = (
    {
        ref,
        children,
        colSpan,
        rowSpan,
        colStart,
        as: Component = 'div',
        className = '',
        ...props
    }: GridItemProps & {
        ref?: React.Ref<HTMLDivElement>;
    }
) => {
    const classes = [
        colSpan ? colSpanClasses(colSpan) : '',
        rowSpan ? rowSpanClasses(rowSpan) : '',
        colStart ? colStartClasses(colStart) : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Component ref={ref} className={classes} {...props}>
            {children}
        </Component>
    );
};
