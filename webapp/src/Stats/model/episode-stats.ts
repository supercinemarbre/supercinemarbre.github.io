import type { Movie } from 'src/Movies/model/movie.model'

type MoviesPerEpisode = number[]

export function computeEpisodeStats(movies: Movie[]) {
  const episodes = countMoviesPerEpisode(movies)
  return {
    episodes,
    average: averageMoviesPerEpisode(episodes),
    min: minMoviesPerEpisode(episodes),
    max: maxMoviesPerEpisode(episodes)
  }
}

function countMoviesPerEpisode(movies: Movie[]): MoviesPerEpisode {
  const moviesPerEpisode: number[] = movies.reduce(
    (acc, movie) => {
        acc[movie.id.episode] = (acc[movie.id.episode] || 0) + 1
        return acc
    },
    []
  )
  return fillHolesWith(moviesPerEpisode, 0)
}

function fillHolesWith<T>(episodes: T[], fillWith: T) {
  for (let i = 0; i < episodes.length; i++) {
    episodes[i] = episodes[i] ?? fillWith
  }
  return episodes
}

function averageMoviesPerEpisode(episodes: MoviesPerEpisode) {
  if (episodes.length === 0) return 0
  const total = episodes.reduce((a, b) => a + b, 0)
  return Math.round((10 * total) / episodes.length) / 10
}

function minMoviesPerEpisode(episodes: MoviesPerEpisode) {
  if (episodes.length === 0) return { episode: 0, count: 0 }
  const minVal = { episode: 0, count: episodes[0] }
  episodes.forEach((count, episode) => {
    if (count < minVal.count && count > 0) {
      minVal.episode = episode
      minVal.count = count
    }
  })
  return minVal
}

function maxMoviesPerEpisode(episodes: MoviesPerEpisode) {
  if (episodes.length === 0) return { episode: 0, count: 0 }
  const maxVal = { episode: 0, count: episodes[0] }
  episodes.forEach((count, episode) => {
    if (count > maxVal.count) {
      maxVal.episode = episode
      maxVal.count = count
    }
  })
  return maxVal
}
