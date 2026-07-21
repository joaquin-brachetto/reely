import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTitles } from '../hooks/useTitles'
import { useDebounce } from '../hooks/useDebounce'
import { usePreferences } from '../context/PreferencesContext'
import { getGenres, getTrendingAll, discoverSection } from '../services/movieService'
import MovieCard from '../components/movies/MovieCard'
import MovieRow from '../components/movies/MovieRow'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import UserMenu from '../components/user/UserMenu'
import AppNavHeader from '../components/layout/AppNavHeader'

const TABS = [
    { key: 'movie', label: 'Películas' },
    { key: 'tv', label: 'Series' },
    { key: 'trending', label: 'Tendencias' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from(
    { length: CURRENT_YEAR - 1900 + 1 },
    (_, i) => CURRENT_YEAR - i
).map(year => ({ value: String(year), label: String(year) }))

export default function HomePage() {
    const navigate = useNavigate()
    const { country } = usePreferences()
    const [searchTerm, setSearchTerm] = useState('')
    const [mediaType, setMediaType] = useState('all')
    const [year, setYear] = useState('')
    const [genreKey, setGenreKey] = useState('')

    const isTrendingTab = mediaType === 'trending'
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const showSections = mediaType === 'all' && !debouncedSearchTerm && !year && !genreKey

    const { data: genresData } = useQuery({
        queryKey: ['genres'],
        queryFn: () => Promise.all([getGenres('movie'), getGenres('tv')]),
        staleTime: Infinity
    })
    const movieGenres = genresData?.[0] || []
    const tvGenres = genresData?.[1] || []

    const genreOptions = useMemo(() => {
        if (mediaType === 'movie') {
            return movieGenres.map(g => ({ key: String(g.id), name: g.name, movie: g.id, tv: undefined }))
        }
        if (mediaType === 'tv') {
            return tvGenres.map(g => ({ key: String(g.id), name: g.name, movie: undefined, tv: g.id }))
        }

        const merged = new Map()
        movieGenres.forEach(g => merged.set(g.name, { key: g.name, name: g.name, movie: g.id, tv: undefined }))
        tvGenres.forEach(g => {
            const existing = merged.get(g.name)
            if (existing) existing.tv = g.id
            else merged.set(g.name, { key: g.name, name: g.name, movie: undefined, tv: g.id })
        })
        return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [mediaType, movieGenres, tvGenres])

    const selectedGenre = genreOptions.find(g => g.key === genreKey)
    const genreIds = selectedGenre ? { movie: selectedGenre.movie, tv: selectedGenre.tv } : undefined

    const { titles, loading: titlesLoading, error: titlesError } = useTitles(mediaType, { 
        query: debouncedSearchTerm, 
        year, 
        genreIds 
    }, {
        enabled: !isTrendingTab && !showSections
    })

    const { data: trendingData, isLoading: trendingLoading, error: trendingQueryError } = useQuery({
        queryKey: ['trending-all'],
        queryFn: () => getTrendingAll().then(data => data.results),
        enabled: isTrendingTab,
        staleTime: 1000 * 60 * 60
    })
    const trending = trendingData || []
    const trendingError = trendingQueryError?.message

    const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
        queryKey: ['home-sections', country],
        queryFn: async () => {
            const definitions = [
                {
                    title: `Top 10 en ${country} hoy`,
                    ranked: true,
                    fetcher: () => getTrendingAll().then(data => data.results.slice(0, 10)),
                },
                {
                    title: 'Aclamadas por la crítica',
                    fetcher: () => discoverSection('movie', { sortBy: 'vote_average.desc', minVotes: 2000 }),
                },
                {
                    title: 'Mejores películas de drama',
                    fetcher: () => discoverSection('movie', { sortBy: 'vote_average.desc', genreId: 18, minVotes: 1000 }),
                },
                {
                    title: 'Comedias populares',
                    fetcher: () => discoverSection('movie', { genreId: 35, region: country }),
                },
                {
                    title: 'Series mejor valoradas',
                    fetcher: () => discoverSection('tv', { sortBy: 'vote_average.desc', minVotes: 1000 }),
                },
                {
                    title: 'Terror y suspenso',
                    fetcher: () => discoverSection('movie', { genreId: 27, region: country }),
                },
                {
                    title: 'Acción a pura adrenalina',
                    fetcher: () => discoverSection('movie', { genreId: 28, region: country }),
                },
                {
                    title: 'Ciencia ficción y fantasía',
                    fetcher: () => discoverSection('movie', { genreId: 878, region: country }),
                },
                {
                    title: 'Animación para toda la familia',
                    fetcher: () => discoverSection('movie', { genreId: 16, region: country }),
                },
                {
                    title: 'Series de crimen y misterio',
                    fetcher: () => discoverSection('tv', { genreId: 80, minVotes: 200 }),
                },
                {
                    title: 'Clásicos de los 90',
                    fetcher: () => discoverSection('movie', { yearFrom: 1990, yearTo: 1999, minVotes: 1000 }),
                },
            ]

            const results = await Promise.all(
                definitions.map(async ({ title, ranked, fetcher }) => {
                    try {
                        const items = await fetcher()
                        return { title, ranked, items }
                    } catch {
                        return { title, ranked, items: [] }
                    }
                })
            )
            return results.filter(s => s.items.length > 0)
        },
        enabled: showSections,
        staleTime: 1000 * 60 * 60
    })
    const sections = sectionsData || []

    const displayedTitles = isTrendingTab ? trending : titles
    const isLoading = isTrendingTab ? trendingLoading : titlesLoading
    const displayedError = isTrendingTab ? trendingError : titlesError

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-7xl mx-auto">
                <AppNavHeader
                    active="home"
                    onHome={() => {
                        setMediaType('all')
                        setSearchTerm('')
                        setYear('')
                        setGenreKey('')
                    }}
                >
                    <div className="flex-1 md:w-72">
                        <InputField
                            name="search"
                            placeholder="Buscar título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <UserMenu />
                </AppNavHeader>

                <div className="flex gap-2 mb-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setMediaType(prev => prev === tab.key ? 'all' : tab.key)
                                setGenreKey('')
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                                mediaType === tab.key
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {(mediaType === 'movie' || mediaType === 'tv') && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:max-w-md">
                        <SelectField
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            options={YEAR_OPTIONS}
                            placeholder="Año de estreno"
                        />
                        <SelectField
                            value={genreKey}
                            onChange={(e) => setGenreKey(e.target.value)}
                            options={genreOptions.map(g => ({ value: g.key, label: g.name }))}
                            placeholder="Género"
                        />
                    </div>
                )}

                {displayedError && !showSections && (
                    <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded mb-8">
                        {displayedError}
                    </div>
                )}

                {showSections ? (
                    sectionsLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        sections.map(section => (
                            <MovieRow
                                key={section.title}
                                title={section.title}
                                items={section.items}
                                ranked={section.ranked}
                            />
                        ))
                    )
                ) : isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : displayedTitles.length === 0 ? (
                    <p className="text-gray-400 text-center">No encontramos resultados con estos filtros.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {displayedTitles.map(item => (
                            <MovieCard
                                key={`${item.media_type}-${item.id}`}
                                movie={item}
                                onClick={() => navigate(`/${item.media_type}/${item.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
