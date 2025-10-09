import type { Movie } from 'src/Movies/model/movie.model'

const MINIMUM_MOVIES = 3

export type DirectorStats = ReturnType<typeof computeDirectorStats>

export function computeDirectorStats(movies: Movie[]) {
  const moviesByDirector = groupMoviesByDirector(movies)
  let previousCount = -1,
    previousRanking = 1

  return {
    minimumMovies: MINIMUM_MOVIES,
    directors: Object.entries(moviesByDirector)
      .map((entry) => ({ director: entry[0], movies: entry[1] }))
      .filter((entry) => entry.movies.length >= MINIMUM_MOVIES)
      .sort((entry1, entry2) => {
        const movieCountDiff = entry2.movies.length - entry1.movies.length
        const tieBreaker = entry1.movies[0].ranking - entry2.movies[0].ranking // best ranking
        return movieCountDiff + tieBreaker * 0.0001
      })
      .map(({ director, movies }, index) => {
        let ranking
        if (movies.length == previousCount) {
          ranking = previousRanking
        } else {
          ranking = index + 1
          previousCount = movies.length
          previousRanking = ranking
        }
        return {
          director,
          movies: movies.sort(byRanking),
          movieCount: movies.length,
          ranking
        }
      })
  }
}

function groupMoviesByDirector(movies: Movie[]) {
  const result: Record<string, Movie[]> = {}
  movies.forEach((movie) => {
    movie.directors?.forEach((director) => {
      if (!result[director]) {
        result[director] = []
      }
      result[director].push(movie)
    })
  })
  return result
}

function byRanking(a: Movie, b: Movie) {
  return a.ranking - b.ranking
}
