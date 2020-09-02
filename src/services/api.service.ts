import { Movie } from '@/types';
import axios from "axios";

let moviesCache: Movie[] | undefined;

export async function fetchMovies(): Promise<Movie[]> {
  if (!moviesCache) {
    const response = await axios.get(`scb_rankings.json?${process.env.VUE_APP_BUILD_TIME}`, { responseType: "json" });
    moviesCache = response.data;
  }
  return moviesCache;
}
