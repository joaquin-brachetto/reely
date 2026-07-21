import React from 'react'

interface Option {
    value: string | number;
    label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: Option[];
    placeholder?: string;
}

export default function SelectField({ options, placeholder = 'Seleccionar...', ...props }: SelectFieldProps) {
    return (
        <select
            {...props}
            className="bg-gray-700 text-white px-4 py-2 rounded outline-none focus:ring-2 focus:ring-green-500 w-full"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}
