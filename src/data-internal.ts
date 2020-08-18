import { readData, writeData } from "./data-io";

export interface Ranking {
  ranking: number;
  title: string;
  episode: number;
}

export interface Movie extends Ranking {
  imdb_id: string;
  imdb_title: string;
  imdb_original_title: string;
  year: number;
}

export function readSCBUrls(): Promise<Record<string, string>> {
  return readData("input/scb_urls.json");
}

export function readDecageRankings(decade: string): Promise<Ranking[] | undefined> {
  try {
    return readData(`output/rankings_${decade}.json`);
  } catch (e) {
    return undefined;
  }
}

export function writeDecageRankings(decade: string, rankings: Ranking[]) {
  writeData(`output/rankings_${decade}.json`, rankings);
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
