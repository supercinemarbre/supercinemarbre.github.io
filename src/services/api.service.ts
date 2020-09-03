import { Episode, Movie } from '@/types';
import axios from "axios";

export type EpisodeMap = Record<number, Episode>;
export type TimestampMap = Record<ScbTitle, number>;
export type ScbTitle = 'string';

const cache: Record<string, unknown> = {};

async function fetchJSON<T>(filename: string): Promise<T> {
  if (!cache[filename]) {
    const response = await axios.get(`${filename}?${process.env.VUE_APP_BUILD_TIME}`, { responseType: "json" });
    cache[filename] = response.data;
  }
  return cache[filename] as T;
}

export async function fetchMovies(): Promise<Movie[]> {
  return fetchJSON('scb_rankings.json');
}

export async function fetchEpisodes(): Promise<EpisodeMap> {
  const episodeList = await fetchJSON<Episode[]>('scb_episodes.json');
  const episodeMap = {};
  episodeList.forEach(e => episodeMap[e.number] = e);
  return episodeMap;
}

export async function fetchTimestamps(): Promise<TimestampMap> {
  return fetchJSON('scb_timestamps.json');
}
