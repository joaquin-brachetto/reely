import { apiClient } from '../lib/axios'

const BASE_URL = '/movies/tmdb'
const OMDB_BASE_URL = '/movies/omdb'

const tagMediaType = (results, mediaType) => results.map(item => ({ ...item, media_type: mediaType }))

export const getOriginalPoster = async (mediaType, id, originalLanguage) => {
    const data = await apiClient.get(`${BASE_URL}/${mediaType}/${id}/images?include_image_language=${originalLanguage},null`)
    const exactMatch = data.posters?.find(p => p.iso_639_1 === originalLanguage)
    const noTextMatch = data.posters?.find(p => p.iso_639_1 === null)
    return exactMatch?.file_path || noTextMatch?.file_path || data.posters?.[0]?.file_path || null
}

const withOriginalPosters = async (results) => {
    return Promise.all(
        results.map(async (item) => {
            try {
                const originalPoster = await getOriginalPoster(item.media_type, item.id, item.original_language)
                return originalPoster ? { ...item, poster_path: originalPoster } : item
            } catch {
                return item
            }
        })
    )
}

export const getGenres = async (mediaType) => {
    const data = await apiClient.get(`${BASE_URL}/genre/${mediaType}/list?language=es-ES`)
    return data.genres
}

const discoverByType = async (mediaType, { year, genreId, page = 1 } = {}) => {
    const params = new URLSearchParams({ page, sort_by: 'popularity.desc' })
    if (year) params.set(mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year', year)
    if (genreId) params.set('with_genres', genreId)

    const data = await apiClient.get(`${BASE_URL}/discover/${mediaType}?${params.toString()}`)
    return { ...data, results: tagMediaType(data.results, mediaType) }
}

export const discoverSection = async (mediaType, { sortBy = 'popularity.desc', genreId, minVotes, region, yearFrom, yearTo } = {}) => {
    const params = new URLSearchParams({ page: 1, sort_by: sortBy })
    if (genreId) params.set('with_genres', genreId)
    if (minVotes) params.set('vote_count.gte', minVotes)
    const dateField = mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'
    if (yearFrom) params.set(`${dateField}.gte`, `${yearFrom}-01-01`)
    if (yearTo) params.set(`${dateField}.lte`, `${yearTo}-12-31`)
    if (region) {
        params.set('watch_region', region)
        params.set('with_watch_monetization_types', 'flatrate|rent|buy|free|ads')
    }

    const data = await apiClient.get(`${BASE_URL}/discover/${mediaType}?${params.toString()}`)
    return tagMediaType(data.results, mediaType)
}

export const discoverTitles = async (mediaType, { year, genreIds } = {}) => {
    if (mediaType === 'all') {
        const [movies, shows] = await Promise.all([
            discoverByType('movie', { year, genreId: genreIds?.movie }),
            discoverByType('tv', { year, genreId: genreIds?.tv }),
        ])
        const results = [...movies.results, ...shows.results].sort((a, b) => b.popularity - a.popularity)
        return { results }
    }

    return discoverByType(mediaType, { year, genreId: genreIds?.[mediaType] })
}

export const searchTitles = async (query, mediaType, { year } = {}) => {
    if (mediaType === 'all') {
        const params = new URLSearchParams({ language: 'es-ES', query, page: 1 })
        const data = await apiClient.get(`${BASE_URL}/search/multi?${params.toString()}`)
        const filtered = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        return { ...data, results: await withOriginalPosters(filtered) }
    }

    const params = new URLSearchParams({ language: 'es-ES', query, page: 1 })
    if (year) params.set(mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year', year)

    const data = await apiClient.get(`${BASE_URL}/search/${mediaType}?${params.toString()}`)
    const tagged = tagMediaType(data.results, mediaType)
    return { ...data, results: await withOriginalPosters(tagged) }
}

export const getTrendingMovies = async () => {
    return apiClient.get(`${BASE_URL}/trending/movie/day`)
}

export const getTrendingAll = async () => {
    const data = await apiClient.get(`${BASE_URL}/trending/all/day`)
    return { ...data, results: data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv') }
}

export const getWatchProviders = async (mediaType, region) => {
    const data = await apiClient.get(`${BASE_URL}/watch/providers/${mediaType}?language=es-ES&watch_region=${region}`)
    return data.results || []
}

export const getCountries = async () => {
    const data = await apiClient.get(`${BASE_URL}/configuration/countries?language=es-ES`)
    return data.sort((a, b) => a.native_name.localeCompare(b.native_name))
}

export const getPersonDetails = async (personId) => {
    return apiClient.get(`${BASE_URL}/person/${personId}?language=es-ES&append_to_response=combined_credits`)
}

export const getDetails = async (mediaType, id) => {
    const certificationAppend = mediaType === 'movie' ? 'release_dates' : 'content_ratings'
    return apiClient.get(`${BASE_URL}/${mediaType}/${id}?language=es-ES&append_to_response=watch/providers,credits,external_ids,${certificationAppend}`)
}

const CERTIFICATION_TO_MIN_AGE = {
    G: 0, PG: 0, 'PG-13': 13, R: 17, 'NC-17': 18,
    'TV-Y': 0, 'TV-Y7': 7, 'TV-G': 0, 'TV-PG': 0, 'TV-14': 14, 'TV-MA': 17,
    A: 0, T: 0, APTA: 0, '7': 7, '12': 12, '16': 16, '18': 18,
    AA: 0, B: 12, 'B15': 15, C: 18, D: 18,
    ATP: 0, '13': 13,
    U: 0, Uc: 0, '12A': 12, '15': 15,
}

const normalizeCertification = (raw) => {
    if (!raw) return null
    const key = raw.trim().toUpperCase()
    const minAge = CERTIFICATION_TO_MIN_AGE[key]
    if (minAge === undefined) return raw
    return minAge === 0 ? 'Apta' : `+${minAge}`
}

export const getCertification = (movie, mediaType, country) => {
    if (mediaType === 'movie') {
        const entries = movie.release_dates?.results || []
        const forCountry = entries.find(e => e.iso_3166_1 === country)
        const fallback = entries.find(e => e.release_dates?.some(d => d.certification))

        const pick = (entry) => entry?.release_dates?.find(d => d.certification)?.certification
        return normalizeCertification(pick(forCountry) || pick(fallback))
    }

    const entries = movie.content_ratings?.results || []
    const forCountry = entries.find(e => e.iso_3166_1 === country)
    const fallback = entries.find(e => e.rating)
    return normalizeCertification(forCountry?.rating || fallback?.rating)
}

export const getExternalRatings = async (imdbId) => {
    if (!imdbId) return null
    try {
        const data = await apiClient.get(`${OMDB_BASE_URL}/?i=${imdbId}`)
        if (data.Response === 'False') return null
        
        const rottenTomatoes = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value
        return {
            imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null,
            rottenTomatoes: rottenTomatoes || null,
        }
    } catch {
        return null
    }
}
