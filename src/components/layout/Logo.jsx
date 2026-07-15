export default function Logo({ onClick, className = '' }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            <svg
                viewBox="0 0 32 32"
                className="w-7 h-7 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <circle cx="16" cy="16" r="14.5" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                <path d="M13 9.5 L23.5 16 L13 22.5 Z" fill="#22c55e" />
            </svg>
            <span className="text-2xl font-extrabold tracking-tight text-white">
                Ree<span className="text-green-500">ly</span>
            </span>
        </div>
    )
}
