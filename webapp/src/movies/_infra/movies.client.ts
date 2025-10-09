import { fetchJSON } from 'src/shared/_infra/fetch-json'
import type { Movie } from '../_model/movie.model'

export type TimestampMap = Record<ScbTitle, number>
export type ScbTitle = 'string'

export function fetchMovies(): Promise<Movie[]> {
  return fetchJSON('scb_movies.json')
}
