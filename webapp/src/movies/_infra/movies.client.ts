import { fetchJSON } from 'src/shared/_infra/fetch-json'
import { Movie } from '../_model/movie.model'

export type TimestampMap = Record<ScbTitle, number>
export type ScbTitle = 'string'

export async function fetchMovies(): Promise<Movie[]> {
  const raw = await fetchJSON<Movie[]>('scb_movies.json')
  return raw.map(movie => new Movie(movie))
}
