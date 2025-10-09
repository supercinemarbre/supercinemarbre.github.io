export interface Episode {

  // ===================== SUPER CINE BATTLE ===================== */

  number: number;
  date: string; // ISO
  title: string;
  url: string;
  mp3url: string;
  decade?: string;

  // ===================== TRANSIENT (CLIENT-ONLY) ===================== */

  searchString?: string;
}

export type EpisodeByNumber = Record<number, Episode>

export function getMaxEpisode(episodes: EpisodeByNumber) {
  return Object.values(episodes)
    .map(e => e.number)
    .reduce((a, b) => Math.max(a, b), 0)
}
