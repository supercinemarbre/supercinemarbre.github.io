import type { Movie } from "./movie.model"
import { toSearchString } from "./search-string"

export class Episode {
  number: number
  date: string // ISO-string
  title: string
  url: string
  mp3url: string
  decade?: string
  searchString: string

  constructor(episode: Omit<Episode, 'searchString'>) {
    Object.assign(this, episode)
    this.searchString = toSearchString(this.title)
  }

  matches(text: string) {
    const searchString = toSearchString(text)
    if (!searchString) return false

    if (this.number?.toString() === searchString) return true
    if (this.decade === searchString) return true
    if (this.searchString?.includes(searchString)) return true
    return false
  }

  matchingMovies(movies: Movie[]): Movie[] {
      return movies.filter(m => m.episode === this.number)
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return a.timestamp - b.timestamp
        }
        return b.timestamp || -a.timestamp
      })
  }
}

export type EpisodeByNumber = Record<number, Episode>


export function getMaxEpisode(episodes: EpisodeByNumber) {
  return Object.values(episodes)
    .map(e => e.number)
    .reduce((a, b) => Math.max(a, b), 0)
}
