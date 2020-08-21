import * as cheerio from "cheerio";
import download from "download";
import { readData, writeData, writeDataString } from "./io";
import { Movie } from "./types";

export type MoviePatch = 'string' | Partial<Movie>;

export function readListUrls(): Promise<Record<string, string>> {
  return readData("input/scb_urls.json");
}

export async function readMovieRankings(): Promise<Movie[] | undefined> {
  try {
    const rankings = await readData(`../../public/scb_rankings.json`);
    if (Array.isArray(rankings)) {
      return rankings;
    } else {
      return Object.values(rankings); // FIXME Issue with initial save
    }
  } catch (e) {
    return undefined;
  }
}

export function writeMovieRankings(rankings: Movie[]): Promise<void> {
  return writeData(`../../public/scb_rankings.json`, rankings);
}

export function readMoviePatch(): Promise<Record<string, MoviePatch>> {
  return readData("patch/scb_rankings_patch.json");
}

export function writeMoviePatch(patch: Record<string, MoviePatch>): void {
  writeDataString(`patch/scb_rankings_patch.json`, JSON.stringify(patch, null, 2));
}

export async function importMovieRankings(): Promise<Movie[]> {
  const scbPages = await readListUrls();
  const scbRankings = await readMovieRankings() || [];

  for (const decade of Object.keys(scbPages)) {
    console.log(`Downloading rankings for decade ${decade}...`);
    const scbPage = await download(scbPages[decade]);
    const $ = cheerio.load(scbPage);
    const rankings = parseRankings($, decade);
    console.log(` - ${rankings.length} movies found`);

    const sizeBefore = scbRankings.length;
    mergeRankings(scbRankings, rankings);
    console.log(` - ${scbRankings.length - sizeBefore} movies added to list`);
  }

  await writeMovieRankings(scbRankings);

  return scbRankings;
}

function mergeRankings(existingRankings: Movie[], newRankings: Movie[]) {
  for (const newRanking of newRankings) {
    if (!existingRankings.find(r => r.scbTitle === newRanking.scbTitle)) {
      existingRankings.push(newRanking);
    }
  }
}

function parseRankings($: CheerioStatic, decade: string): Movie[] {
  const rankings: Movie[] = [];

  const rows = $("table tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows.get(i) as CheerioElement;
    const cells = $("td", row);
    if (cells.length > 0) {
      const episode = parseInt($(cells.get(2)).text().trim(), 10);
      const scbTitle = $(cells.get(1)).text().trim();
      const ranking = parseInt($(cells.get(0)).text().trim(), 10);
      if (ranking && scbTitle) {
        rankings.push({
          decade,
          episode,
          scbTitle,
          ranking
        });
      }
    }
  }

  return rankings;
}
