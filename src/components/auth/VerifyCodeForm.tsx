import InputField from '../ui/InputField'
import Button from '../ui/Button'

export default function VerifyCodeForm({ formData, error, message, loading, onChange, onSubmit, onBack, onResendCode }: any) {
    return (
        <div className="w-full">
            <h1 className="text-white text-2xl font-bold mb-2 text-center">Verificar cuenta</h1>
            <p className="text-gray-400 text-sm text-center mb-6">
                Ingresá el código de 6 dígitos que te enviamos por email
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
                    name="code"
                    placeholder="Código de 6 dígitos"
                    value={formData.code}
                    onChange={onChange}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Verificando...' : 'Verificar'}
                </Button>
            </form>

            <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" onClick={onBack}>
                    Volver al inicio
                </Button>
                <Button variant="ghost" onClick={onResendCode} disabled={loading}>
                    Reenviar código
                </Button>
            </div>
        </div>
    )
}
