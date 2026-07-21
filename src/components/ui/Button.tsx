import React from 'react'

const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-green-400 hover:underline'
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
}

export default function Button({ children, variant = 'primary', ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={`${variants[variant]} disabled:opacity-50 py-2 px-4 rounded font-semibold transition`}
        >
            {children}
        </button>
    )
}
