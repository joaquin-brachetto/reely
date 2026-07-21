import React from 'react'

export default function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            autoComplete="new-password"
            {...props}
            className="bg-gray-700 text-white px-4 py-2 rounded outline-none focus:ring-2 focus:ring-green-500 w-full"
        />
    )
}
