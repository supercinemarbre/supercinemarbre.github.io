import { Movie } from '@/types';
import axios from "axios";

export async function fetchMovies(): Promise<Movie[]> {
  const response = await axios.get(`scb_rankings.json?${process.env.VUE_APP_BUILD_TIME}`, { responseType: "json" });
  return response.data;
}
