import { EpisodeMap } from './api.service';

export function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 8)).toUpperCase();
}

export function getMaxEpisode(episodes: EpisodeMap) {
  return Object.values(episodes)
    .map(e => e.number)
    .reduce((a, b) => Math.max(a, b), 0);
}
