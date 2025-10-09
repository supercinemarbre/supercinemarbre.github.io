import type { Movie } from 'src/Movies/model/movie.model'

const MINIMUM_MOVIES = 5

export type ActorStats = ReturnType<typeof computeActorStats>

export function computeActorStats(movies: Movie[]) {
  const moviesByActor = groupMoviesByActor(movies)
  let previousCount = -1,
    previousRanking = 1
  return {
    actors: Object.entries(moviesByActor)
      .map((entry) => ({ actor: entry[0], movies: entry[1] }))
      .filter((entry) => entry.movies.length >= MINIMUM_MOVIES)
      .sort((entry1, entry2) => {
        const movieCountDiff = entry2.movies.length - entry1.movies.length
        const tieBreaker = entry1.movies[0].ranking - entry2.movies[0].ranking // best ranking
        return movieCountDiff + tieBreaker * 0.0001
      })
      .map(({ actor, movies }, index) => {
        let ranking
        if (movies.length == previousCount) {
          ranking = previousRanking
        } else {
          ranking = index + 1
          previousCount = movies.length
          previousRanking = ranking
        }
        return {
          actor,
          movies: movies.sort(byRanking),
          movieCount: movies.length,
          ranking
        }
      }),
    minimumMovies: MINIMUM_MOVIES
  }
}

function groupMoviesByActor(movies: Movie[]) {
  const result: Record<string, Movie[]> = {}
  movies.forEach((movie) => {
    movie.actors?.forEach((actor) => {
      if (!result[actor]) {
        result[actor] = []
      }
      result[actor].push(movie)
    })
  })
  return result
}

function byRanking(a: Movie, b: Movie) {
  return a.ranking - b.ranking
}
