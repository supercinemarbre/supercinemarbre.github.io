import { Movie } from '@/types';
import axios from "axios";

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

export async function fetchEpisodes(): Promise<Movie[]> {
  return fetchJSON('scb_episodes.json');
}


