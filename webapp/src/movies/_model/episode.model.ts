import type { EpisodeMap } from "../_infra/episodes.client";

export function getMaxEpisode(episodes: EpisodeMap) {
  return Object.values(episodes)
    .map(e => e.number)
    .reduce((a, b) => Math.max(a, b), 0);
}
