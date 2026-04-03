import React from 'react';

export interface OpenCosmosIconProps {
    /** Size of the icon in pixels @default 20 */
    size?: number;
    /** Additional className */
    className?: string;
}

/**
 * OpenCosmos brand icon — an orbital system: outer ring, tilted ellipse, center star.
 * Uses currentColor so it inherits text color from its parent.
 */
export const OpenCosmosIcon = ({
    ref,
    size = 20,
    className = '',
}: OpenCosmosIconProps & { ref?: React.Ref<SVGSVGElement> }) => (
    <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {/* Outer ring — the cosmos boundary */}
        <circle cx="12" cy="12" r="9.5" strokeWidth="1.5" />
        {/* Orbital ellipse — tilted to suggest motion */}
        <ellipse cx="12" cy="12" rx="9.5" ry="3.2" strokeWidth="1.25" transform="rotate(-35 12 12)" />
        {/* Center star — the origin */}
        <circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none" />
    </svg>
);
