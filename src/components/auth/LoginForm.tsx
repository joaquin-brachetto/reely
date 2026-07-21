import InputField from '../ui/InputField'
import Button from '../ui/Button'

export default function LoginForm({ formData, error, message, loading, onChange, onSubmit, onForgotPassword, isBlocked }: any) {
    return (
        <div className="w-full">


            {message && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded mb-4 text-sm">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} autoComplete='off' className="flex flex-col gap-4">
                <InputField
                    name="identifier"
                    placeholder="Email o usuario"
                    value={formData.identifier}
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
                <Button type="submit" disabled={loading || isBlocked}>
                    {isBlocked ? 'Bloqueado temporalmente' : loading ? 'Cargando...' : 'Entrar'}
                </Button>
            </form>

            <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" onClick={onForgotPassword}>
                    ¿Olvidaste tu contraseña?
                </Button>
            </div>
        </div>
    )
}