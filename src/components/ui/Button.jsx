const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-green-400 hover:underline'
}

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${variants[variant]} disabled:opacity-50 py-2 px-4 rounded font-semibold transition`}
        >
            {children}
        </button>
    )
}

