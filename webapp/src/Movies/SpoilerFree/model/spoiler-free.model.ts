import { Episode, getMaxEpisode } from 'src/Movies/model/episode.model'
import type { Movie } from 'src/Movies/model/movie.model'

export class SpoilerFreeSettings {
  public readonly enabled: boolean
  private readonly lastWatchedRaw: number
  private readonly maxEpisode: number

  constructor({
    enabled,
    lastWatched,
    episodes
  }: {
    enabled: boolean
    lastWatched: number
    episodes: Episode[]
  }) {
    this.enabled = enabled
    this.lastWatchedRaw = lastWatched
    this.maxEpisode = getMaxEpisode(episodes)
  }

  isMovieVisible(movie: Movie) {
    return movie.id.episode <= this.lastWatched
  }

  get lastWatched() {
    if (!this.enabled) {
      return this.maxEpisode
    }

    return clamp(this.lastWatchedRaw, 1, 999)
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
