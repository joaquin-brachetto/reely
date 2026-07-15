export default function InputField({ type = 'text', name, placeholder, value, onChange }) {
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete="new-password"
            className="bg-gray-700 text-white px-4 py-2 rounded outline-none focus:ring-2 focus:ring-green-500 w-full"
        />
    )
}

