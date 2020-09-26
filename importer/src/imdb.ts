import download from 'download';
import { isEqual } from 'lodash';
import * as scb from "./scb";
import { Movie } from './types';

export interface ImdbPerson {
  nconst: string;
  primaryName: string;
  birthYear: string;
  deathYear: string;
  primaryProfession: string;
  knownForTitles: string;
}

export interface ImdbMovie {
  tconst: string;
  primaryTitle: string;
}

export async function fetchMissingIMDBData(sublist?: Movie[]) {
  console.log("Filling any missing IMDB data");
  const movies = sublist ?? await scb.readMovieRankings();
  const patches = await scb.readScbPatches();

  let i = 1, pendingWrites = 0;
  for (const movie of movies) {
    if (hasMissingIMDBData(movie)) {
      const matchingPatch = patches.find(p => isEqual(p.scbKey, movie.id) || isEqual(p.id, movie.id));
      let imdbMovie: ImdbMovie = await getIMDBSuggestion(matchingPatch?.tconst || movie.title);

      if (!imdbMovie) {
        console.log(` - ${i}/${movies.length}: No match found for ${movie.id.episode} ${movie.id.name}`);
        if (!patches[movie.title]) {
          patches[movie.title] = null;
        }
      } else {
        console.log(` - ${i}/${movies.length}: OK for ${movie.title}`)
        Object.assign(movie, imdbMovie);
        const patchValue = patches[movie.title];
        if (typeof patchValue !== 'string') {
          Object.assign(movie, patchValue);
        }
        if (!sublist && ++pendingWrites % 50 == 0) {
          await scb.writeMovieRankings(movies);
          pendingWrites = 0;
        }
      }
    }
    i++;
  }

  if (!sublist) {
    await scb.writeMovieRankings(movies);
  }
}

async function getIMDBSuggestion(titleOrTconst: string): Promise<ImdbMovie | undefined> {
  try {
    const searchString = titleOrTconst.trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20);
    const imdbUrl = `https://v2.sg.media-imdb.com/suggestion/${searchString[0]}/${searchString}.json`;
    const resultString = await download(imdbUrl);
    const result = JSON.parse(resultString.toString()) as {
      d: Array<{
        i: {
          imageUrl: string;
        },
        q: 'feature' | string; // type
        l: string; // title
        id: string; // tconst
      }>
    };
    if (result.d) {
      const movies = result.d.filter(r => r.q === 'feature');
      if (movies.length > 0) {
        const suggestion = movies[0];
        return {
          tconst: suggestion.id,
          primaryTitle: suggestion.l
        };
      }
    }
  } catch (e) {
    console.warn(`Failed to search ${titleOrTconst} on IMDB suggestions endpoint`);
  }
}

export function hasMissingIMDBData(movie: Movie) {
  return (!movie.tconst
      || !movie.primaryTitle);
}

export function invalidateIMDBData(movie: Movie) {
  delete movie.tconst;
  delete movie.primaryTitle;
}
