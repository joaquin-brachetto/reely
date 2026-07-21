import { Bookmark } from 'lucide-react'
import { useWatchlist } from '../../context/WatchlistContext'
import type { MediaItem } from '../../types'

const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_URL

export default function MovieCard({ movie, onClick }: { movie: MediaItem | any, onClick?: (e: any) => void }) {
    const { isSaved, toggle } = useWatchlist()
    const title = movie.original_title || movie.title || movie.original_name || movie.name
    const date = movie.release_date || movie.first_air_date
    const isUpcoming = date && date > new Date().toISOString().split('T')[0]
    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=Sin+Imagen'

    const saved = isSaved(movie.media_type, movie.id)

    const handleToggleSave = (e: React.MouseEvent) => {
        e.stopPropagation()
        toggle({ mediaType: movie.media_type, tmdbId: movie.id, title, posterPath: movie.poster_path, releaseDate: date })
    }

    return (
        <div
            onClick={onClick}
            className="group relative rounded-xl overflow-hidden border border-white/20 shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
            <img
                src={posterPath}
                alt={title}
                title={title}
                draggable="false"
                className="w-full h-auto object-cover"
                loading="lazy"
            />
            {isUpcoming && (
                <span className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                    Próximamente
                </span>
            )}
            <button
                onClick={handleToggleSave}
                title={saved ? 'Quitar de mi watchlist' : 'Guardar en mi watchlist'}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Bookmark className="w-4 h-4" fill={saved ? '#22c55e' : 'none'} color={saved ? '#22c55e' : 'white'} />
            </button>
        </div>
    )
}
