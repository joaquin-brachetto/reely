import { useNavigate } from 'react-router-dom'
import { useWatchlist } from '../context/WatchlistContext'
import MovieCard from '../components/movies/MovieCard'
import UserMenu from '../components/user/UserMenu'
import AppNavHeader from '../components/layout/AppNavHeader'

export default function WatchlistPage() {
    const navigate = useNavigate()
    const { watchlist, loading } = useWatchlist()

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">
                <AppNavHeader active="watchlist">
                    <UserMenu />
                </AppNavHeader>

                {loading ? (
                    <p className="text-white text-center">Cargando...</p>
                ) : watchlist.length === 0 ? (
                    <p className="text-gray-400 text-center">Todavía no guardaste ninguna película o serie.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {watchlist.map(item => (
                            <MovieCard
                                key={`${item.media_type}-${item.tmdb_id}`}
                                movie={{
                                    id: item.tmdb_id,
                                    media_type: item.media_type,
                                    title: item.title,
                                    poster_path: item.poster_path,
                                    release_date: item.release_date,
                                }}
                                onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
