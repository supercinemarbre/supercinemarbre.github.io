import { fetchJSON } from 'src/shared/infra/fetch-json'
import { Episode } from '../model/episode.model'

export async function fetchEpisodes(): Promise<Episode[]> {
  const rawEpisodes = await fetchJSON<Episode[]>('scb_episodes.json')
  return rawEpisodes.map(episode => new Episode(episode))
}
