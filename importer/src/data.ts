import { ImdbMovie } from "./imdb";
import { readData, writeData, writeDataString } from "./io";

export interface Ranking {
  decade: string;
  episode: number;
  scbTitle: string;
  ranking: number;
}

export interface Movie extends Ranking, Partial<ImdbMovie> { }

export function readSCBUrls(): Promise<Record<string, string>> {
  return readData("input/scb_urls.json");
}

export async function readScbRankings(): Promise<Movie[] | undefined> {
  try {
    const rankings = await readData(`output/scb_rankings.json`);
    if (Array.isArray(rankings)) {
      return rankings;
    } else {
      return Object.values(rankings); // XXX
    }
  } catch (e) {
    return undefined;
  }
}

export function writeScbRankings(rankings: Movie[]): Promise<void> {
  return writeData(`output/scb_rankings.json`, rankings);
}

export function readScbRankingsPatch(): Promise<Record<string, string>> {
  return readData("patch/scb_rankings_patch.json");
}

export function writeScbRankingsPatch(patch: Record<string, string>): void {
  writeDataString(`patch/scb_rankings_patch.json`, JSON.stringify(patch, null, 2));
}
