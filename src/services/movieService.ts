import { apiClient } from '../lib/axios'
import type { Genre } from '../types'

const BASE_URL = '/movies/tmdb'
const OMDB_BASE_URL = '/movies/omdb'

const tagMediaType = <T extends object>(results: T[], mediaType: 'movie' | 'tv' | 'person') => 
    results.map(item => ({ ...item, media_type: mediaType }))

export const getOriginalPoster = async (mediaType: string, id: number, originalLanguage: string | null): Promise<string | null> => {
    const data = await apiClient.get<any, any>(`${BASE_URL}/${mediaType}/${id}/images?include_image_language=${originalLanguage},null`)
    const exactMatch = data.posters?.find((p: any) => p.iso_639_1 === originalLanguage)
    const noTextMatch = data.posters?.find((p: any) => p.iso_639_1 === null)
    return exactMatch?.file_path || noTextMatch?.file_path || data.posters?.[0]?.file_path || null
}

const withOriginalPosters = async <T extends object>(results: T[]): Promise<T[]> => {
    return Promise.all(
        results.map(async (item: any) => {
            try {
                const originalPoster = await getOriginalPoster(item.media_type, item.id, item.original_language)
                return originalPoster ? { ...item, poster_path: originalPoster } : item
            } catch {
                return item
            }
        })
    )
}

export const getGenres = async (mediaType: 'movie' | 'tv'): Promise<Genre[]> => {
    const data = await apiClient.get<any, any>(`${BASE_URL}/genre/${mediaType}/list?language=es-ES`)
    return data.genres
}

const discoverByType = async (mediaType: 'movie' | 'tv', { year, genreId, page = 1 }: { year?: string; genreId?: number | string; page?: number } = {}) => {
    const params = new URLSearchParams({ page: String(page), sort_by: 'popularity.desc' })
    if (year) params.set(mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year', year)
    if (genreId) params.set('with_genres', String(genreId))

    const data = await apiClient.get<any, any>(`${BASE_URL}/discover/${mediaType}?${params.toString()}`)
    return { ...data, results: tagMediaType(data.results, mediaType) }
}

export const discoverSection = async (
    mediaType: 'movie' | 'tv', 
    { sortBy = 'popularity.desc', genreId, minVotes, region, yearFrom, yearTo, withWatchProviders }: 
    { sortBy?: string; genreId?: number; minVotes?: number; region?: string; yearFrom?: number; yearTo?: number; withWatchProviders?: string } = {}
) => {
    const params = new URLSearchParams({ page: '1', sort_by: sortBy })
    if (genreId) params.set('with_genres', String(genreId))
    if (minVotes) params.set('vote_count.gte', String(minVotes))
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'
    if (yearFrom) params.set(`${dateField}.gte`, `${yearFrom}-01-01`)
    if (yearTo) params.set(`${dateField}.lte`, `${yearTo}-12-31`)
    if (region) {
        params.set('watch_region', region)
        params.set('with_watch_monetization_types', 'flatrate|rent|buy|free|ads')
    }
    if (withWatchProviders) {
        params.set('with_watch_providers', withWatchProviders)
    }

    const data = await apiClient.get<any, any>(`${BASE_URL}/discover/${mediaType}?${params.toString()}`)
    return tagMediaType(data.results, mediaType)
}

export const discoverTitles = async (mediaType: 'all' | 'movie' | 'tv', { year, genreIds, page = 1 }: { year?: string; genreIds?: any; page?: number } = {}) => {
    if (mediaType === 'all') {
        const [movies, shows] = await Promise.all([
            discoverByType('movie', { year, genreId: genreIds?.movie, page }),
            discoverByType('tv', { year, genreId: genreIds?.tv, page }),
        ])
        const results = [...movies.results, ...shows.results].sort((a: any, b: any) => b.popularity - a.popularity)
        return { 
            results, 
            total_pages: Math.max(movies.total_pages || 1, shows.total_pages || 1),
            total_results: (movies.total_results || 0) + (shows.total_results || 0)
        }
    }

    return discoverByType(mediaType, { year, genreId: genreIds?.[mediaType], page })
}

export const searchTitles = async (query: string, mediaType: 'all' | 'movie' | 'tv', { year, page = 1 }: { year?: string; page?: number } = {}) => {
    if (mediaType === 'all') {
        const params = new URLSearchParams({ language: 'es-ES', query, page: String(page) })
        const data = await apiClient.get<any, any>(`${BASE_URL}/search/multi?${params.toString()}`)
        const filtered = data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        return { ...data, results: await withOriginalPosters(filtered) }
    }

    const params = new URLSearchParams({ language: 'es-ES', query, page: String(page) })
    if (year) params.set(mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year', year)

    const data = await apiClient.get<any, any>(`${BASE_URL}/search/${mediaType}?${params.toString()}`)
    const tagged = tagMediaType(data.results, mediaType)
    return { ...data, results: await withOriginalPosters(tagged) }
}

export const getTrendingMovies = async () => {
    return apiClient.get<any, any>(`${BASE_URL}/trending/movie/day`)
}

export const getTrendingAll = async () => {
    const data = await apiClient.get<any, any>(`${BASE_URL}/trending/all/day`)
    return { ...data, results: data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') }
}

export const getWatchProviders = async (mediaType: string, region: string) => {
    const data = await apiClient.get<any, any>(`${BASE_URL}/watch/providers/${mediaType}?language=es-ES&watch_region=${region}`)
    return data.results || []
}

export const getCountries = async () => {
    const data = await apiClient.get<any, any>(`${BASE_URL}/configuration/countries?language=es-ES`)
    return data.sort((a: any, b: any) => a.native_name.localeCompare(b.native_name))
}

export const getPersonDetails = async (personId: string | number) => {
    return apiClient.get<any, any>(`${BASE_URL}/person/${personId}?language=es-ES&append_to_response=combined_credits`)
}

export const getDetails = async (mediaType: string, id: string | number) => {
    const certificationAppend = mediaType === 'movie' ? 'release_dates' : 'content_ratings'
    return apiClient.get<any, any>(`${BASE_URL}/${mediaType}/${id}?language=es-ES&append_to_response=watch/providers,credits,external_ids,${certificationAppend}`)
}

const CERTIFICATION_TO_MIN_AGE: Record<string, number> = {
    G: 0, PG: 0, 'PG-13': 13, R: 17, 'NC-17': 18,
    'TV-Y': 0, 'TV-Y7': 7, 'TV-G': 0, 'TV-PG': 0, 'TV-14': 14, 'TV-MA': 17,
    A: 0, T: 0, APTA: 0, '7': 7, '12': 12, '16': 16, '18': 18,
    AA: 0, B: 12, 'B15': 15, C: 18, D: 18,
    ATP: 0, '13': 13,
    U: 0, Uc: 0, '12A': 12, '15': 15,
}

const normalizeCertification = (raw: string | undefined | null): string | null => {
    if (!raw) return null
    const key = raw.trim().toUpperCase()
    const minAge = CERTIFICATION_TO_MIN_AGE[key]
    if (minAge === undefined) return raw
    return minAge === 0 ? 'Apta' : `+${minAge}`
}

export const getCertification = (movie: any, mediaType: string, country: string): string | null => {
    if (mediaType === 'movie') {
        const entries = movie.release_dates?.results || []
        const forCountry = entries.find((e: any) => e.iso_3166_1 === country)
        const fallback = entries.find((e: any) => e.release_dates?.some((d: any) => d.certification))

        const pick = (entry: any) => entry?.release_dates?.find((d: any) => d.certification)?.certification
        return normalizeCertification(pick(forCountry) || pick(fallback))
    }

    const entries = movie.content_ratings?.results || []
    const forCountry = entries.find((e: any) => e.iso_3166_1 === country)
    const fallback = entries.find((e: any) => e.rating)
    return normalizeCertification(forCountry?.rating || fallback?.rating)
}

export const getExternalRatings = async (imdbId: string | undefined): Promise<{ imdbRating: string | null, rottenTomatoes: string | null } | null> => {
    if (!imdbId) return null
    try {
        const data = await apiClient.get<any, any>(`${OMDB_BASE_URL}/?i=${imdbId}`)
        if (data.Response === 'False') return null
        
        const rottenTomatoes = data.Ratings?.find((r: any) => r.Source === 'Rotten Tomatoes')?.Value
        return {
            imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null,
            rottenTomatoes: rottenTomatoes || null,
        }
    } catch {
        return null
    }
}
