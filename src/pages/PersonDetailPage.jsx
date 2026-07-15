import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getPersonDetails } from '../services/movieService'
import MovieCard from '../components/movies/MovieCard'

const PROFILE_BASE_URL = 'https://image.tmdb.org/t/p/w300'

export default function PersonDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [person, setPerson] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false

        const fetchPerson = async () => {
            setLoading(true)
            setError(null)
            setPerson(null)
            try {
                const data = await getPersonDetails(id)
                if (!cancelled) setPerson(data)
            } catch (err) {
                if (!cancelled) setError(err.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchPerson()
        window.scrollTo(0, 0)
        return () => { cancelled = true }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-white">Cargando...</p>
            </div>
        )
    }

    if (error || !person) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error || 'No se encontró el actor'}</p>
                <button onClick={() => navigate(-1)} className="text-green-400 hover:underline">
                    Volver
                </button>
            </div>
        )
    }

    const profilePath = person.profile_path
        ? `${PROFILE_BASE_URL}${person.profile_path}`
        : 'https://via.placeholder.com/300x450?text=Sin+Foto'

    const filmography = (person.combined_credits?.cast || [])
        .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
        .sort((a, b) => b.popularity - a.popularity)
        .filter((item, index, arr) =>
            arr.findIndex(i => i.id === item.id && i.media_type === item.media_type) === index
        )

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                </button>

                <div className="flex flex-col sm:flex-row gap-8">
                    <img
                        src={profilePath}
                        alt={person.name}
                        draggable="false"
                        className="w-56 rounded-lg self-center sm:self-start shrink-0 bg-white/10"
                    />

                    <div className="flex-1">
                        <h1 className="text-3xl text-white font-bold">{person.name}</h1>
                        <div className="flex flex-wrap gap-3 mt-2 mb-6 text-sm text-gray-400">
                            {person.birthday && <span>Nacimiento: {person.birthday.split('-').reverse().join('/')}</span>}
                            {person.place_of_birth && <span>{person.place_of_birth}</span>}
                        </div>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                            {person.biography || 'Sin biografía disponible.'}
                        </p>
                    </div>
                </div>

                {filmography.length > 0 && (
                    <div className="mt-12">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Filmografía
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {filmography.map(item => (
                                <MovieCard
                                    key={`${item.media_type}-${item.id}`}
                                    movie={item}
                                    onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
