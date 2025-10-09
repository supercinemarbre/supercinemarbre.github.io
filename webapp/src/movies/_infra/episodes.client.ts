import { fetchJSON } from 'src/shared/_infra/fetch-json'
import type { Episode, EpisodeByNumber } from '../_model/episode.model'

export async function fetchEpisodes(): Promise<EpisodeByNumber> {
  const episodeList = await fetchJSON<Episode[]>('scb_episodes.json')
  const episodeByNumber: EpisodeByNumber = {}
  episodeList.forEach((e) => (episodeByNumber[e.number] = e))
  return episodeByNumber
}
