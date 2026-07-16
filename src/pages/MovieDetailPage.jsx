import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { getDetails, getOriginalPoster, getExternalRatings, getCertification } from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import { usePreferences } from '../context/PreferencesContext'
import { useWatchlist } from '../context/WatchlistContext'
import { ImdbIcon, RottenTomatoesIcon } from '../components/movies/RatingIcons'

const POSTER_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_URL
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280'
const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w92'
const PROFILE_BASE_URL = 'https://image.tmdb.org/t/p/w185'

const formatRuntime = (minutes) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const PROVIDER_GROUPS = [
    { key: 'flatrate', label: 'Suscripción' },
    { key: 'rent', label: 'Alquiler' },
    { key: 'buy', label: 'Compra' },
]

const VALID_MEDIA_TYPES = ['movie', 'tv']

export default function MovieDetailPage() {
    const { mediaType, id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { country } = usePreferences()
    const { isSaved, toggle } = useWatchlist()

    const [movie, setMovie] = useState(null)
    const [originalPosterPath, setOriginalPosterPath] = useState(null)
    const [ratings, setRatings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const isValidMediaType = VALID_MEDIA_TYPES.includes(mediaType)

    useEffect(() => {
        if (!isValidMediaType) {
            setLoading(false)
            return
        }

        let cancelled = false

        const fetchDetails = async () => {
            setLoading(true)
            setError(null)
            setMovie(null)
            setOriginalPosterPath(null)
            setRatings(null)
            try {
                const data = await getDetails(mediaType, id)
                if (cancelled) return
                setMovie(data)

                try {
                    const originalPoster = await getOriginalPoster(mediaType, id, data.original_language)
                    if (!cancelled && originalPoster) setOriginalPosterPath(originalPoster)
                } catch {}

                const imdbId = data.external_ids?.imdb_id || data.imdb_id
                try {
                    const externalRatings = await getExternalRatings(imdbId)
                    if (!cancelled) setRatings(externalRatings)
                } catch {}
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchDetails()
        window.scrollTo(0, 0)
        return () => { cancelled = true }
    }, [mediaType, id, isValidMediaType])

    if (loading) {
        return (
            <div className="min-h-screen bg-black p-8">
                <div className="max-w-5xl mx-auto animate-pulse">
                    <div className="flex flex-col sm:flex-row gap-8">
                        <div className="w-56 aspect-[2/3] rounded-lg bg-gray-800 shrink-0 self-center sm:self-start" />

                        <div className="flex-1 w-full">
                            <div className="h-8 w-2/3 bg-gray-800 rounded mb-4" />
                            <div className="h-5 w-24 bg-gray-800 rounded mb-6" />

                            <div className="space-y-2 mb-8">
                                <div className="h-3 w-full bg-gray-800 rounded" />
                                <div className="h-3 w-full bg-gray-800 rounded" />
                                <div className="h-3 w-2/3 bg-gray-800 rounded" />
                            </div>

                            <div className="h-3 w-24 bg-gray-800 rounded mb-3" />
                            <div className="flex gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-lg bg-gray-800" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <div className="h-3 w-20 bg-gray-800 rounded mb-4" />
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div key={i}>
                                    <div className="w-full aspect-[2/3] rounded-lg bg-gray-800 mb-2" />
                                    <div className="h-3 w-3/4 bg-gray-800 rounded mb-1" />
                                    <div className="h-2 w-1/2 bg-gray-800 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!isValidMediaType || error || !movie) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error || 'No se encontró el título'}</p>
                <button onClick={() => navigate(-1)} className="text-green-400 hover:underline">
                    Volver
                </button>
            </div>
        )
    }

    const title = movie.original_title || movie.title || movie.original_name || movie.name
    const releaseDate = movie.release_date || movie.first_air_date
    const isUpcoming = releaseDate && releaseDate > new Date().toISOString().split('T')[0]
    const posterPath = originalPosterPath || movie.poster_path
        ? `${POSTER_BASE_URL}${originalPosterPath || movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=Sin+Imagen'

    const providers = movie['watch/providers']?.results?.[country]
    const hasStreaming = providers && PROVIDER_GROUPS.some(({ key }) => providers[key])
    const isInTheaters = mediaType === 'movie' && !isUpcoming && !hasStreaming
    const cast = movie.credits?.cast?.slice(0, 12) || []

    const runtime = mediaType === 'movie'
        ? formatRuntime(movie.runtime)
        : formatRuntime(movie.episode_run_time?.[0])

    const director = mediaType === 'movie'
        ? movie.credits?.crew?.find(c => c.job === 'Director')?.name
        : movie.created_by?.[0]?.name
    const directorLabel = mediaType === 'movie' ? 'Dirigido por' : 'Creado por'

    const certification = getCertification(movie, mediaType, country)

    return (
        <div className="min-h-screen bg-black relative">
            {movie.backdrop_path && (
                <div className="relative h-64 sm:h-96 -mb-24 sm:-mb-32">
                    <div
                        className="absolute inset-0 bg-cover"
                        style={{
                            backgroundImage: `url(${BACKDROP_BASE_URL}${movie.backdrop_path})`,
                            backgroundPosition: 'center 20%',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                </div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto p-8">
                {!user && (
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center gap-2 text-gray-300 hover:text-white text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-8">
                    <div className="relative self-center sm:self-start shrink-0">
                        <img
                            src={posterPath}
                            alt={title}
                            draggable="false"
                            className="w-56 rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => user
                                ? toggle({ mediaType, tmdbId: Number(id), title, posterPath: movie.poster_path, releaseDate })
                                : navigate('/login')}
                            title={!user
                                ? 'Iniciá sesión para guardar en tu watchlist'
                                : isSaved(mediaType, Number(id)) ? 'Quitar de mi watchlist' : 'Guardar en mi watchlist'}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition"
                        >
                            <Bookmark
                                className="w-4 h-4"
                                fill={user && isSaved(mediaType, Number(id)) ? '#22c55e' : 'none'}
                                color={user && isSaved(mediaType, Number(id)) ? '#22c55e' : 'white'}
                            />
                        </button>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-3 mb-1">
                            <h1 className="text-3xl text-white font-bold">{title}</h1>
                            <span className="text-sm text-gray-300">{releaseDate ? releaseDate.split('-')[0] : 'N/A'}</span>
                            {certification && (
                                <span className="text-xs font-bold text-gray-300 border border-gray-500 px-1.5 py-0.5 rounded">
                                    {certification}
                                </span>
                            )}
                            {runtime && <span className="text-sm text-gray-300">{runtime}</span>}
                            {director && <span className="text-sm text-gray-300">{directorLabel} {director}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-gray-300">
                            {ratings?.imdbRating && (
                                <span className="flex items-center gap-1.5" title="Rating de IMDB">
                                    <ImdbIcon className="w-8 h-4" />
                                    <span className="text-white font-semibold">{ratings.imdbRating}/10</span>
                                </span>
                            )}
                            {ratings?.rottenTomatoes && (
                                <span className="flex items-center gap-1.5" title="Rating de Rotten Tomatoes">
                                    <RottenTomatoesIcon className="w-4 h-4" />
                                    <span className="text-white font-semibold">{ratings.rottenTomatoes}</span>
                                </span>
                            )}
                            {isUpcoming && (
                                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    Próximamente
                                </span>
                            )}
                        </div>

                        {isUpcoming && (
                            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-4 py-2 rounded mb-6 text-sm">
                                Todavía no se estrenó
                                {releaseDate && ` — fecha de estreno: ${releaseDate.split('-').reverse().join('/')}`}.
                            </div>
                        )}

                        <p className="text-gray-300 leading-relaxed mb-8">
                            {movie.overview || 'Sin descripción disponible.'}
                        </p>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Dónde ver
                            </p>

                            {isUpcoming && (
                                <p className="text-sm text-gray-400">
                                    Todavía no tiene disponibilidad de streaming: no se ha estrenado.
                                </p>
                            )}

                            {!isUpcoming && isInTheaters && (
                                <p className="text-sm text-yellow-400">
                                    Actualmente en cines. Todavía no está disponible en streaming ni alquiler para tu región.
                                </p>
                            )}

                            {!isUpcoming && !isInTheaters && !hasStreaming && (
                                <p className="text-sm text-gray-400">
                                    No encontramos disponibilidad de streaming para tu región.
                                </p>
                            )}

                            {!isUpcoming && providers && PROVIDER_GROUPS.map(({ key, label }) => (
                                providers[key] && (
                                    <div key={key} className="mb-4">
                                        <p className="text-xs text-gray-400 mb-2">{label}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {providers[key].map((provider) => (
                                                <img
                                                    key={provider.provider_id}
                                                    src={`${LOGO_BASE_URL}${provider.logo_path}`}
                                                    alt={provider.provider_name}
                                                    title={provider.provider_name}
                                                    className="w-10 h-10 rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {cast.length > 0 && (
                    <div className="mt-12">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Reparto
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5">
                            {cast.map((actor) => (
                                <div
                                    key={actor.cast_id ?? actor.credit_id}
                                    onClick={() => navigate(`/person/${actor.id}`)}
                                    className="text-center cursor-pointer group"
                                >
                                    <img
                                        src={actor.profile_path
                                            ? `${PROFILE_BASE_URL}${actor.profile_path}`
                                            : 'https://via.placeholder.com/185x278?text=Sin+Foto'}
                                        alt={actor.name}
                                        draggable="false"
                                        className="w-full aspect-[2/3] object-cover rounded-lg mb-2 bg-white/10 group-hover:scale-105 transition-transform duration-200"
                                    />
                                    <p className="text-white text-sm font-semibold truncate">{actor.name}</p>
                                    <p className="text-gray-400 text-xs truncate">{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
