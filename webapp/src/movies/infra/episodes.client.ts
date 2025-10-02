import { fetchJSON } from 'src/shared/infra/fetch-json'
import type { Episode } from 'src/types.d'

export type EpisodeMap = Record<number, Episode>

export async function fetchEpisodes(): Promise<EpisodeMap> {
  const episodeList = await fetchJSON<Episode[]>('scb_episodes.json')
  const episodeMap: EpisodeMap = {};
  episodeList.forEach((e) => (episodeMap[e.number] = e))
  return episodeMap
}
