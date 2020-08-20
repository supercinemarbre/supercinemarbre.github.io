import axios from "axios";

export interface Ranking {
  decade: string;
  episode: number;
  scbTitle: string;
  ranking: number;
}

export interface ImdbMovie {
  tconst: string;
  titleType: string;
  primaryTitle: string;
  originalTitle: string;
  isAdult: string;
  startYear: number;
  endYear: number;
  runtimeMinutes: number;
  genres: string;
}

export interface Movie extends Ranking, Partial<ImdbMovie> { }

export async function fetchMovies(): Promise<Movie[]> {
  const response = await axios.get("data/output/scb_rankings.json", { responseType: "json" });
  return response.data;
}
