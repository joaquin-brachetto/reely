export default function SelectField({ value, onChange, options, placeholder }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className="bg-gray-700 text-white px-4 py-2 rounded outline-none focus:ring-2 focus:ring-green-500 w-full"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}
