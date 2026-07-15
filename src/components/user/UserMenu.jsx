import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, X, LogOut, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePreferences } from '../../context/PreferencesContext'
import { getWatchProviders, getCountries } from '../../services/movieService'
import SelectField from '../ui/SelectField'

const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w92'

const LANGUAGE_OPTIONS = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'pt', label: 'Portugués' },
    { value: 'fr', label: 'Francés' },
    { value: 'de', label: 'Alemán' },
    { value: 'it', label: 'Italiano' },
    { value: 'ja', label: 'Japonés' },
    { value: 'ko', label: 'Coreano' },
    { value: 'zh', label: 'Chino' },
]

export default function UserMenu() {
    const { user, logout } = useAuth()
    const { preferences, country, updatePreferences } = usePreferences()
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [providers, setProviders] = useState([])
    const [countries, setCountries] = useState([])
    const [draft, setDraft] = useState(preferences)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        if (!open) return
        setDraft(preferences)
        setSaved(false)
    }, [open])

    useEffect(() => {
        if (!open) return
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        getWatchProviders('movie', draft.region || country).then(setProviders).catch(() => {})
        getCountries().then(setCountries).catch(() => {})
    }, [open, draft.region, country])

    const countryOptions = useMemo(
        () => countries.map(c => ({ value: c.iso_3166_1, label: c.native_name })),
        [countries]
    )

    const toggleProvider = (providerId) => {
        const current = draft.providerIds || []
        const next = current.includes(providerId)
            ? current.filter(id => id !== providerId)
            : [...current, providerId]
        setDraft(prev => ({ ...prev, providerIds: next }))
        setSaved(false)
    }

    const handleSaveChanges = async () => {
        await updatePreferences(draft)
        setSaved(true)
    }

    const handleLogout = () => {
        logout()
        setOpen(false)
        navigate('/login')
    }

    if (!user) return null

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
                title={user.username}
            >
                <User className="w-5 h-5" />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-white text-xl font-bold">{user.username}</h2>
                        <p className="text-gray-400 text-sm mb-6">{user.email}</p>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Región
                                </p>
                                <SelectField
                                    value={draft.region || ''}
                                    onChange={(e) => { setDraft(prev => ({ ...prev, region: e.target.value || null })); setSaved(false) }}
                                    options={countryOptions}
                                    placeholder={`Auto (${country})`}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Idioma
                                </p>
                                <SelectField
                                    value={draft.language || ''}
                                    onChange={(e) => { setDraft(prev => ({ ...prev, language: e.target.value || null })); setSaved(false) }}
                                    options={LANGUAGE_OPTIONS}
                                    placeholder="Español (por defecto)"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Servicios de streaming favoritos
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {providers.map(provider => {
                                        const selected = (draft.providerIds || []).includes(provider.provider_id)
                                        return (
                                            <button
                                                key={provider.provider_id}
                                                onClick={() => toggleProvider(provider.provider_id)}
                                                title={provider.provider_name}
                                                className={`rounded-lg overflow-hidden border-2 transition ${
                                                    selected ? 'border-green-500' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={`${LOGO_BASE_URL}${provider.logo_path}`}
                                                    alt={provider.provider_name}
                                                    className="w-10 h-10"
                                                />
                                            </button>
                                        )
                                    })}
                                    {providers.length === 0 && (
                                        <p className="text-sm text-gray-400">Cargando proveedores...</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveChanges}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                            >
                                {saved ? <Check className="w-4 h-4" /> : null}
                                {saved ? 'Cambios guardados' : 'Guardar cambios'}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
