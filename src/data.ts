import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export interface Ranking {
  ranking: number;
  title: string;
  episode: number;
}


export function readSCBUrls(): Record<string, string> {
  const data = readData("input/scb_urls.json");
  return JSON.parse(data);
}

export function readDecageRankings(decade: string): Ranking[] | undefined {
  try {
    const data = readData(`output/rankings_${decade}.json`);
    return JSON.parse(data);
  } catch (e) {
    return undefined;
  }
}

export function writeDecageRankings(decade: string, rankings: Ranking[]) {
  const data = JSON.stringify(rankings, null, 2);
  writeData(`output/rankings_${decade}.json`, data);
}

function readData(file: string) {
  return readFileSync(resolve(__dirname, "../data", file)).toString();
}

function writeData(file: string, data: string) {
  writeFileSync(resolve(__dirname, "../data", file), data);
}
