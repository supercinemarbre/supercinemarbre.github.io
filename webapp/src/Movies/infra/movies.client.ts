import { fetchJSON } from 'src/shared/infra/fetch-json'
import { Movie } from '../model/movie.model'

export type TimestampMap = Record<ScbTitle, number>
export type ScbTitle = 'string'

export async function fetchMovies(): Promise<Movie[]> {
  const raw = await fetchJSON<Movie[]>('scb_movies.json')
  return raw.map(movie => new Movie(movie))
}
