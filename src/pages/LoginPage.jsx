import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Sparkles } from 'lucide-react'
import { useAuthForm } from '../hooks/useAuthForm'
import { getTrendingMovies } from '../services/movieService'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import VerifyCodeForm from '../components/auth/VerifyCodeForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'
import Logo from '../components/layout/Logo'
import fondo from '../assets/logo.jpg'

const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original'
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342'

// Cache en memoria: al volver a /login no se repite el fetch ni el fade
let trendingCache = null

const views = {
    login: (props) => <LoginForm {...props} />,
    register: (props) => <RegisterForm {...props} />,
    verify: (props) => <VerifyCodeForm {...props} />,
    forgot: (props) => <ForgotPasswordForm {...props} />,
    reset: (props) => <ResetPasswordForm {...props} />,
}

export default function LoginPage() {
    const {
        currentView,
        formData,
        error,
        message,
        loading,
        handleChange,
        handleLogin,
        handleRegister,
        handleVerify,
        handleForgotPassword,
        handleResetPassword,
        handleResendCode,
        isBlocked,
        goToView
    } = useAuthForm()

    const navigate = useNavigate()
    const [showForms, setShowForms] = useState(false)
    const [backdrop, setBackdrop] = useState(trendingCache?.backdrop ?? null)
    const [backdropMovie, setBackdropMovie] = useState(trendingCache?.backdropMovie ?? null)
    const [trending, setTrending] = useState(trendingCache?.trending ?? [])
    const [isLoading, setIsLoading] = useState(!trendingCache)

    useEffect(() => {
        if (trendingCache) return

        const fetchTrending = async () => {
            try {
                const data = await getTrendingMovies()
                const results = data.results || []
                const withBackdrop = results.find((movie) => movie.backdrop_path)
                const nextBackdrop = withBackdrop
                    ? `${BACKDROP_BASE_URL}${withBackdrop.backdrop_path}`
                    : fondo
                const nextTrending = results.filter((movie) => movie.poster_path).slice(0, 6)
                trendingCache = {
                    backdrop: nextBackdrop,
                    backdropMovie: withBackdrop || null,
                    trending: nextTrending,
                }
                setBackdrop(nextBackdrop)
                setBackdropMovie(withBackdrop || null)
                setTrending(nextTrending)
            } catch {
                setBackdrop(fondo)
                setTrending([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchTrending()
    }, [])

    const commonProps = {
        formData,
        error,
        message,
        loading,
        onChange: handleChange,
    }

    const viewProps = {
        login: {
            ...commonProps,
            onSubmit: handleLogin,
            onForgotPassword: () => goToView('forgot'),
            isBlocked,
        },
        register: {
            ...commonProps,
            onSubmit: handleRegister,
        },
        verify: {
            ...commonProps,
            onSubmit: handleVerify,
            onResendCode: handleResendCode,
            onBack: () => goToView('login'),
        },
        forgot: {
            ...commonProps,
            onSubmit: handleForgotPassword,
            onBack: () => goToView('login'),
        },
        reset: {
            ...commonProps,
            onSubmit: handleResetPassword,
            onBack: () => goToView('login'),
        },
    }

    const openModal = (view) => {
        goToView(view)
        setShowForms(true)
    }

    const closeModal = () => {
        setShowForms(false)
        goToView('login')
    }

    const features = [
        {
            icon: Search,
            title: "Descubre películas",
            description: "Explora un catálogo inmenso, desde los últimos estrenos hasta clásicos atemporales.",
        },
        {
            icon: Star,
            title: "Lleva un registro",
            description: "Lleva un registro de lo que has visto, califícalo con estrellas y guárdalo en tu lista de seguimiento personal.",
        },
        {
            icon: Sparkles,
            title: "Obtén recomendaciones",
            description: "Recibe sugerencias de películas basadas en tus gustos únicos y en lo que están viendo otros entusiastas del cine.",
        },
    ]

    return (
        <div className="min-h-screen bg-black relative flex flex-col font-sans overflow-hidden">
            <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <div
                    className="absolute inset-0 bg-cover"
                    style={{
                        backgroundImage: backdrop ? `url(${backdrop})` : 'none',
                        backgroundPosition: 'center 20%',
                        maskImage: 'radial-gradient(ellipse 90% 75% at 50% 30%, black 0%, black 30%, transparent 85%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 75% at 50% 30%, black 0%, black 30%, transparent 85%)',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/90" />
            </div>

            <nav className="relative z-20 flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
                <Logo onClick={closeModal} />

                {!(showForms && currentView === 'login') ? (
                    <div className="flex gap-6 text-sm font-bold text-gray-400 tracking-wide uppercase">
                        <button
                            onClick={() => openModal('login')}
                            className="hover:text-white transition"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => openModal('register')}
                            className={`hover:text-white transition ${currentView === 'register' && showForms ? 'text-white' : ''}`}
                        >
                            Crear cuenta
                        </button>
                    </div>
                ) : (
                <div className="absolute top-6 right-8 flex flex-col items-end z-50">
                    <form
                        onSubmit={handleLogin}
                        autoComplete="off"
                        className="flex items-end gap-3 bg-gray-900/95 border border-white/10 rounded-lg p-3 shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-500 hover:text-white font-bold text-lg self-center px-1"
                        >
                            &times;
                        </button>

                        <div className="flex flex-col">
                            <label className="text-[11px] font-bold text-gray-400 tracking-wide mb-1">
                                Email o usuario
                            </label>
                            <input
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                autoComplete="off"
                                className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded outline-none focus:ring-2 focus:ring-green-500 w-44"
                            />
                        </div>

                        <div className="flex flex-col">
                            <div className="flex justify-between items-center mb-1 gap-3">
                                <label className="text-[11px] font-bold text-gray-400 tracking-wide">
                                    Contraseña
                                </label>
                                <button
                                    type="button"
                                    onClick={() => goToView('forgot')}
                                    className="text-[11px] font-bold text-green-500 hover:text-green-400"
                                >
                                    ¿Olvidaste?
                                </button>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded outline-none focus:ring-2 focus:ring-green-500 w-44"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isBlocked}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold uppercase tracking-wide px-5 py-1.5 rounded transition"
                        >
                            {isBlocked ? 'Bloqueado' : loading ? '...' : 'Entrar'}
                        </button>
                    </form>

                    {message && (
                        <p className="text-green-400 text-xs mt-2">{message}</p>
                    )}
                    {error && (
                        <p className="text-red-400 text-xs mt-2">{error}</p>
                    )}
                </div>
                )}
            </nav>

            <div className="relative z-10 flex-grow flex items-center justify-center p-4">
                {(!showForms || currentView === 'login') && (
                    <div className="flex flex-col items-center gap-20 py-10 w-full">

                        <div className="text-center max-w-3xl px-6">
                            <p className="text-4xl text-white font-extrabold tracking-tight mb-10 max-w-2xl mx-auto [text-shadow:_0_2px_16px_rgb(0_0_0_/_90%)]">
                                Elige tus proveedores favoritos de series y de películas online y encuentra qué hay de nuevo.
                            </p>
                            <button
                                onClick={() => openModal('register')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
                            >
                                Crea una cuenta - ¡es gratis!
                            </button>
                        </div>

                        {trending.length > 0 && (
                            <div className="w-full max-w-5xl px-8">
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                    {trending.map((movie) => (
                                        <div
                                            key={movie.id}
                                            onClick={() => navigate(`/movie/${movie.id}`)}
                                            className="rounded-lg overflow-hidden border border-white/20 shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
                                        >
                                            <img
                                                src={`${POSTER_BASE_URL}${movie.poster_path}`}
                                                alt={movie.original_title || movie.title}
                                                draggable="false"
                                                className="w-full h-auto object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="w-full max-w-5xl px-8">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] text-left mb-4">
                                REELY TE PERMITE...
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon
                                    return (
                                        <div key={index} className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 shadow-md flex flex-col items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1">
                                                <Icon className="w-5 h-5 text-green-400" strokeWidth={2} />
                                            </div>
                                            <p className="text-base text-white font-bold text-center">
                                                {feature.title}
                                            </p>
                                            <p className="text-xs text-gray-300 text-center leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {showForms && currentView !== 'login' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-sm backdrop-blur-md bg-white/10 p-8 rounded-xl border border-white/20 shadow-2xl">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl"
                        >
                            &times;
                        </button>
                        {views[currentView](viewProps[currentView])}
                    </div>
                </div>
            )}

            {backdropMovie && (
                <div className="absolute bottom-4 left-6 z-20 pointer-events-none opacity-40">
                    <p className="text-white text-xs font-medium tracking-wider">
                        {backdropMovie.title || backdropMovie.original_title || backdropMovie.name}
                        {backdropMovie.release_date || backdropMovie.first_air_date ? ` (${(backdropMovie.release_date || backdropMovie.first_air_date).substring(0, 4)})` : ''}
                    </p>
                </div>
            )}
        </div>
    )
}