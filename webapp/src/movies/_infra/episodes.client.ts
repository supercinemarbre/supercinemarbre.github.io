import { fetchJSON } from 'src/shared/_infra/fetch-json'
import { Episode, type EpisodeByNumber } from '../_model/episode.model'

export async function fetchEpisodes(): Promise<EpisodeByNumber> {
  const episodeList = await fetchJSON<Episode[]>('scb_episodes.json')
  const episodeByNumber: EpisodeByNumber = {}
  episodeList.forEach(episode => episodeByNumber[episode.number] = new Episode(episode))
  return episodeByNumber
}
