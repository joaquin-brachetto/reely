export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TMDbItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string | null;
  backdrop_path?: string | null;
  genre_ids?: number[];
  vote_average?: number;
  vote_count?: number;
  overview?: string;
  popularity?: number;
}

export interface Movie extends TMDbItem {
  media_type: 'movie';
  title: string;
  original_title?: string;
  release_date?: string;
}

export interface TVShow extends TMDbItem {
  media_type: 'tv';
  name: string;
  original_name?: string;
  first_air_date?: string;
}

export interface Person extends TMDbItem {
  media_type: 'person';
  name: string;
  original_name?: string;
  profile_path?: string | null;
  known_for_department?: string;
}

export type MediaItem = Movie | TVShow | Person;

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface VideosResponse {
  results: Video[];
}

export interface WatchlistItem {
  media_type: 'movie' | 'tv';
  tmdb_id: number;
  title?: string;
  poster_path?: string | null;
  release_date?: string | null;
}

export interface Preferences {
  region: string | null;
  language: string | null;
  providerIds: number[];
}
