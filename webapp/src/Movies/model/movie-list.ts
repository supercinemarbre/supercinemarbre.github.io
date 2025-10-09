import type { Movie } from "./movie.model"

export function sortByYear(a: Movie, b: Movie) {
  return (b.year || 0) - (a.year || 0)
}

export function sortByRanking(a: Movie, b: Movie) {
  return a.ranking - b.ranking
}

export function matchDecade(decade: string) {
  return (movie: Movie) => movie.decade === decade
}
