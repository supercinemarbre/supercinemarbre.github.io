import { readData, writeData } from "./io";
import { ImdbMovie } from "./imdb";

export interface Ranking {
  decade: string;
  episode: number;
  title: string;
  rawTitle: string;
  ranking: number;
}

export interface Movie extends Ranking, Partial<ImdbMovie> { }

export function readSCBUrls(): Promise<Record<string, string>> {
  return readData("input/scb_urls.json");
}

export async function readScbRankings(): Promise<Movie[] | undefined> {
  try {
    return Object.values(await readData(`output/scb_rankings.json`)) as any;
  } catch (e) {
    return undefined;
  }
}

export function writeScbRankings(rankings: Movie[]) {
  writeData(`output/scb_rankings.json`, rankings);
}

export function readDb(): Promise<Movie[] | undefined> {
  try {
    return readData(`output/db.json`);
  } catch (e) {
    return undefined;
  }
}

export function writeDb(movies: Movie[]) {
  writeData(`output/db.json`, movies);
}

interface ImdbName {
  nconst: string;
  primaryName: string;
  birthYear: string;
  deathYear: string;
  primaryProfession: string;
  knownForTitles: string;
}
