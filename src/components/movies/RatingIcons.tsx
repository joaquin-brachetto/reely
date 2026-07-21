interface IconProps {
    className?: string;
}

export function ImdbIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 64 32" className={className} xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="32" rx="4" fill="#F5C518" />
            <text
                x="32"
                y="22"
                textAnchor="middle"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="700"
                fontSize="16"
                fill="#000000"
            >
                IMDb
            </text>
        </svg>
    )
}

export function RottenTomatoesIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M11 3c.6-1 1.6-1.6 2.7-1.6.4 0 .8.2 1 .5.3.4.2.9-.2 1.2-.5.4-1 .6-1.5 1 1.7-.2 3.4.3 4.7 1.4A7.5 7.5 0 0 1 20 11.5 7.5 7.5 0 0 1 12.5 19 7.5 7.5 0 0 1 5 11.5c0-2.6 1.5-4.9 3.7-6A7.4 7.4 0 0 1 11 3z" fill="#4CAF50" />
            <circle cx="12.5" cy="14.5" r="7.5" fill="#EE3B33" />
            <ellipse cx="9.8" cy="11.6" rx="1.6" ry="1.1" fill="#FF6B61" opacity="0.6" />
        </svg>
    )
}
