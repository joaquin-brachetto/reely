import InputField from '../ui/InputField'
import Button from '../ui/Button'

export default function ForgotPasswordForm({ formData, error, message, loading, onChange, onSubmit, onBack }) {
    return (
        <div className="w-full">
            <h1 className="text-white text-2xl font-bold mb-2 text-center">Recuperar contraseña</h1>
            <p className="text-gray-400 text-sm text-center mb-6">
                Ingresá tu email y te enviaremos un código para restablecer tu contraseña
            </p>

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

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <InputField
                    type="email"
                    name="email"
                    placeholder="Tu email"
                    value={formData.email}
                    onChange={onChange}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar código'}
                </Button>
            </form>

            <p className="text-gray-400 text-sm text-center mt-4">
                <Button variant="ghost" onClick={onBack}>
                    Volver al login
                </Button>
            </p>
        </div>
    )
}
