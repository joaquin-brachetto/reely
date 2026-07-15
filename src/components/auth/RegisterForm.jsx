import InputField from '../ui/InputField'
import Button from '../ui/Button'

export default function RegisterForm({ formData, error, loading, onChange, onSubmit }) {
    return (
        <div className="w-full">
            <h1 className="text-white text-2xl font-bold mb-6 text-center">Únete a Reely</h1>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} autoComplete="off" className="flex flex-col gap-4">
                <InputField
                    name="username"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={onChange}
                />
                <InputField
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={onChange}
                />
                <InputField
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={onChange}
                    autoComplete="new-password"
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Registrarse'}
                </Button>
            </form>
        </div>
    )
}
