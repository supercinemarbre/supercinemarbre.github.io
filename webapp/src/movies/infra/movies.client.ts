import { fetchJSON } from 'src/shared/infra/fetch-json'
import type { Movie } from 'src/types.d'

export type TimestampMap = Record<ScbTitle, number>
export type ScbTitle = 'string'

export function fetchMovies(): Promise<Movie[]> {
  return fetchJSON('scb_movies.json')
}
