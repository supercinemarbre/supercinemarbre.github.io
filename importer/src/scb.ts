import * as cheerio from "cheerio";
import download from "download";
import { readData, writeData, writeDataString } from "./io";
import { Movie } from "./types";

export type MoviePatch = 'string' | Partial<Movie>;

export interface ScbEpisode {
  number: number;
  date: string; // ISO
  title: string;
  url: string;
  mp3url: string;
  decade?: string;
}

export function readListUrls(): Promise<Record<string, string>> {
  return readData("scb_urls.json");
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

export async function scrapeScbEpisodes(): Promise<void> {
  console.log("Scraping SCB Episodes");

  const allMovies = await readMovieRankings();
  const episodeCount = allMovies
    .map(movie => movie.episode)
    .reduce((e1, e2) => Math.max(e1, e2), 0);
  const episodes = await readScbEpisodes();

  for (let episodeNumber = 0; episodeNumber <= episodeCount; episodeNumber++) {
    if (!episodes.find(e => e.number === episodeNumber)) {
      const episodeDecade = getEpisodeDecade(episodeNumber, allMovies)
      const episode = await scrapeScbEpisode(episodeNumber, episodeDecade);
      if (episode) {
        episodes.push(episode);
        console.log(` - Episode ${episode.number} ${episode.title}: OK`);
      } else {
        console.log(` - Episode ${episodeNumber}: NOT FOUND`);
      }
      episodes.sort((e1, e2) => e1.number - e2.number);
      await writeScbEpisodes(episodes);
    }
  }
}

function getEpisodeDecade(episodeNumber: number, allMovies: Movie[]): string | undefined {
  if (episodeNumber === 30) {
    return "2000"; // movies are wrongly ranked as episode 29 in the list
  }

  const decadesOfRankedMovies = allMovies
    .filter(movie => movie.episode === episodeNumber)
    .map(movie => movie.decade)

  if (decadesOfRankedMovies.length === 1) {
    return decadesOfRankedMovies[0];
  }
  if (decadesOfRankedMovies.length > 0) {
    return decadesOfRankedMovies.reduce((e1, e2) => e1 === e2 ? e1 : undefined);
  }
}

async function scrapeScbEpisode(episodeNumber: number, episodeDecade?: string): Promise<ScbEpisode | undefined> {
  let titlePrefix = 'Battle';
  if (episodeNumber <= 77) {
    titlePrefix = 'pisode';
  }
  if ([108, 109].includes(episodeNumber)) {
    titlePrefix = 'Batlle';
  }

  const searchResults = await download(`https://www.supercinebattle.fr/?s=${titlePrefix}+${episodeNumber}+%3A`);
  let $ = cheerio.load(searchResults);

  let $titleLink: CheerioElement | undefined;
  $('.entry-title').each((_, $element) => {
    const linkTitle = $($element).text();
    if (!$titleLink && (linkTitle.includes(`${titlePrefix} ${episodeNumber} :`)
      || linkTitle.includes(`${titlePrefix} ${episodeNumber}:`))) {
      $titleLink = $element;
    }
  });
  if (!$titleLink) {
    console.warn(`No search result matching episode ${episodeNumber}. Found links :`);
    $('.entry-title').each((_, $element) => console.log(' > ' + $($element).text()));
    return;
  }

  const pageUrl = $('a', $titleLink).attr('href');
  const linkTitle = $($titleLink).text();
  const episodeTitle = linkTitle.slice(linkTitle.indexOf(':') + 1).trim();
  const episodeTitleCapitalized = episodeTitle.slice(0, 1).toUpperCase() + episodeTitle.slice(1);

  const episodePage = await download(pageUrl);
  $ = cheerio.load(episodePage);
  const mp3url = $('.podcast-meta-download').attr('href');
  const date = $('.entry-date').attr('datetime');

  return {
    number: episodeNumber,
    title: episodeTitleCapitalized,
    url: pageUrl,
    mp3url,
    decade: episodeDecade,
    date
  };
}

async function readScbEpisodes(): Promise<ScbEpisode[] | undefined> {
  try {
    const rankings = await readData(`../../public/scb_episodes.json`);
    if (Array.isArray(rankings)) {
      return rankings;
    } else {
      return Object.values(rankings); // FIXME Issue with initial save
    }
  } catch (e) {
    return undefined;
  }
}

function writeScbEpisodes(episodes: ScbEpisode[]): Promise<void> {
  return writeData(`../../public/scb_episodes.json`, episodes);
}


export function readScbPatch(): Promise<Record<string, MoviePatch>> {
  return readData("scb_patch.json");
}

export function writeScbPatch(patch: Record<string, MoviePatch>): void {
  writeDataString(`scb_patch.json`, JSON.stringify(patch, null, 2));
}

export async function scrapeMovieRankings(): Promise<Movie[]> {
  console.log(`Downloading Super Cine Battle rankings`);

  const scbPages = await readListUrls();
  const scbRankings = await readMovieRankings() || [];

  for (const decade of Object.keys(scbPages)) {
    const scbPage = await download(scbPages[decade]);
    const $ = cheerio.load(scbPage);
    const rankings = parseRankings($, decade);
    console.log(` - ${rankings.length} movies found for decade ${decade}`);

    const sizeBefore = scbRankings.length;
    mergeRankings(scbRankings, rankings);
    if (scbRankings.length > sizeBefore) {
      console.log(`   ${scbRankings.length - sizeBefore} movies added to the list`);
    } else {
      console.log('   (OK, nothing new)')
    }
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
          title: scbTitle,
          ranking
        });
      }
    }
  }

  return rankings;
}
