import * as cheerio from "cheerio";
import download from "download";
import { isEqual } from "lodash";
import { readData, writeData, writeDataString } from "./io";
import { Episode, Movie, MovieID } from "./types";

export type MoviePatch = Partial<Movie> & { scbKey: MovieID };

export function readListUrls(): Promise<Record<string, string>> {
  return readData("scb_urls.json");
}

export async function readMovieRankings(): Promise<Movie[] | undefined> {
  try {
    const rankings = await readData(`../../webapp/public/scb_movies.json`);
    if (Array.isArray(rankings)) {
      return rankings;
    } else {
      return Object.values(rankings); // FIXME Issue with initial save
    }
  } catch (e) {
    return undefined;
  }
}

export async function writeMovieRankings(movies: Movie[]): Promise<void> {
  await writeData(`../../webapp/public/scb_movies.json`, movies);
  await writeData(`../../docs/scb_movies.json`, movies);
}

export async function scrapeScbEpisodes(): Promise<void> {
  console.log("Scraping SCB Episodes");

  const allMovies = await readMovieRankings();
  const episodeCount = await detectEpisodeCount();
  const episodes = await readScbEpisodes();

  for (let episodeNumber = 0; episodeNumber <= episodeCount; episodeNumber++) {
    if (episodeNumber === 29) {}

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
    .filter(movie => movie.id.episode === episodeNumber)
    .map(movie => movie.decade)

  if (decadesOfRankedMovies.length === 1) {
    return decadesOfRankedMovies[0];
  }
  if (decadesOfRankedMovies.length > 0) {
    return decadesOfRankedMovies.reduce((e1, e2) => e1 === e2 ? e1 : undefined);
  }
}

async function scrapeScbEpisode(episodeNumber: number, episodeDecade?: string): Promise<Episode | undefined> {
  let titlePrefix = 'Battle';
  if (episodeNumber <= 77) {
    titlePrefix = 'pisode';
  }
  if ([108, 109].includes(episodeNumber)) {
    titlePrefix = 'Batlle';
  }

  const searchResults = await download(`https://www.supercinebattle.fr/?s=${titlePrefix}+${episodeNumber}+%3A`);
  let $ = cheerio.load(searchResults);

  let $titleLink: cheerio.Element | undefined;
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

async function readScbEpisodes(): Promise<Episode[] | undefined> {
  try {
    const rankings = await readData(`../../webapp/public/scb_episodes.json`);
    if (Array.isArray(rankings)) {
      return rankings;
    } else {
      return Object.values(rankings); // XXX Array is sometimes parsed as object
    }
  } catch (e) {
    return undefined;
  }
}

async function writeScbEpisodes(episodes: Episode[]): Promise<void> {
  await writeData(`../../webapp/public/scb_episodes.json`, episodes);
  await writeData(`../../docs/scb_episodes.json`, episodes);
}

export async function readScbPatches(): Promise<MoviePatch[]> {
  const patches = await readData("scb_patch.json");
  if (Array.isArray(patches)) {
    return patches;
  } else {
    return Object.values(patches); // XXX Array is sometimes parsed as object
  }
}

export function writeScbPatch(patch: MoviePatch[]): void {
  writeDataString(`scb_patch.json`, JSON.stringify(patch, null, 2));
}

/**
 * @deprecated Use the Google Sheets importer only
 */
export async function scrapeMovieRankings(): Promise<Movie[]> {
  console.log(`Downloading Super Cine Battle rankings`);

  const scbPages = await readListUrls();
  const scbRankings = await readMovieRankings() || [];
  const patches = await readScbPatches();

  for (const decade of Object.keys(scbPages)) {
    const scbPage = await download(scbPages[decade]);
    const $ = cheerio.load(scbPage);
    const rankings = parseMovies($, decade, patches);
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
    if (!existingRankings.find(r => isEqual(r.id, newRanking.id))) {
      existingRankings.push(newRanking);
    }
  }
}

function parseMovies($: cheerio.Root, decade: string, patches: MoviePatch[]): Movie[] {
  const movies: Movie[] = [];

  const rows = $("table tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows.get(i) as cheerio.Element;
    const cells = $("td", row);
    if (cells.length > 0) {
      const episode = parseInt($(cells.get(2)).text().trim(), 10);
      const name = $(cells.get(1)).text().trim();
      const ranking = parseInt($(cells.get(0)).text().trim(), 10);
      if (ranking && name) {
        const movie: Movie = {
          id: { 
            episode: isNaN(episode) ? null : episode,
            name
          },
          decade,
          title: name,
          ranking
        };

        const matchingPatch = patches.find(p => isEqual(p.scbKey, movie.id));
        if (matchingPatch) {
          delete matchingPatch.scbKey;
          Object.assign(movie, matchingPatch);
        }

        movies.push(movie);
      }
    }
  }

  return movies;
}


async function detectEpisodeCount(): Promise<number> {
  try {
    const homePage = await download('https://www.supercinebattle.fr');
    let $ = cheerio.load(homePage);

    let episodeCount: undefined | number;
    $('.entry-title a').each((_, element) => {
      if (!episodeCount) {
        const title = $(element).text();
        if (title.match(/Super Ciné Battle [0-9]+.*/g)) {
          episodeCount = parseInt(title.replace('Super Ciné Battle', '').split(/^[0-9]/)[0]);
        }
      }
    });
    
    if (!episodeCount) {
      throw new Error('No episode posts found on the front page');
    }
    return episodeCount;

  } catch (e) {
    console.warn("Failed to detect episode count on SCB");
    return (await readMovieRankings())
    .map(movie => movie.id.episode)
    .reduce((e1, e2) => Math.max(e1, e2), 0);
  }
}
