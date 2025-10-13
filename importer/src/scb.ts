import * as cheerio from "cheerio";
import download from "download";
import { readData, writeData } from "./io";
import { markAsUpdated, needsUpdate } from "./last-updated";
import { Episode, Movie, MovieID } from "./types";
import { Element } from "domhandler";

export type MoviePatch = Partial<Movie> & { scbKey: MovieID };
export type EpisodePatch = Partial<Episode> & { number: number };

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
  if (!process.env.SCB_FORCE && !await needsUpdate('scb-episodes')) {
    console.log('Skipping Super Cine Battle episodes as recently updated (use SCB_FORCE=true to override)')
    return;
  }

  console.log("Scraping Super Cine Battle episodes");

  const allMovies = await readMovieRankings();
  const episodeCount = await detectEpisodeCount();
  const episodes = await readScbEpisodes();

  for (let episodeNumber = 0; episodeNumber <= episodeCount; episodeNumber++) {
    if (!episodes.find(e => e.number === episodeNumber) && episodeNumber !== 200) { // ugly fix to bypass episode 200
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

  console.log("Patching episodes");
  const patches = await readScbEpisodePatches();
  for (let patch of patches) {
    const episodeToPatch = episodes.find(episode => patch.number === episode.number);
    Object.assign(episodeToPatch, patch);
  }
  await writeScbEpisodes(episodes);

  await markAsUpdated('scb-episodes');
}

function getEpisodeDecade(episodeNumber: number, allMovies: Movie[]): string | undefined {
  if (episodeNumber === 30) {
    return "2000"; // movies are wrongly ranked as episode 29 in the list
  }

  const decadesOfRankedMovies = allMovies
    .filter(movie => movie.id.episode === episodeNumber)
    .map(movie => movie.decade)

  const occurrences = {};
  decadesOfRankedMovies.forEach(decade => {
    occurrences[decade] = occurrences[decade] ? (occurrences[decade] + 1) : 1
  });

  return Object.keys(occurrences)
    .reduce((decade1, decade2) => occurrences[decade2] > occurrences[decade1] ? decade2 : decade1);
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

  let $titleLink: Element | undefined;
  $('.entry-title').each((_, $element) => {
    const linkTitle = $($element).text();
    if (!$titleLink && (linkTitle.match(new RegExp(`${titlePrefix}\\s+${episodeNumber}\\s+:`, 'gi'))
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

async function readScbEpisodes(): Promise<Episode[]> {
  try {
    const rankings = await readData(`../../webapp/public/scb_episodes.json`);
    if (Array.isArray(rankings)) {
      return rankings;
    } else {
      return Object.values(rankings) || []; // XXX Array is sometimes parsed as object
    }
  } catch (e) {
    return [];
  }
}

async function writeScbEpisodes(episodes: Episode[]): Promise<void> {
  await writeData(`../../webapp/public/scb_episodes.json`, episodes);
  await writeData(`../../docs/scb_episodes.json`, episodes);
}

async function readScbEpisodePatches(): Promise<EpisodePatch[]> {
  const patches = await readData("episode_patch.json");
  if (Array.isArray(patches)) {
    return patches;
  } else {
    return Object.values(patches); // XXX Array is sometimes parsed as object
  }
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
