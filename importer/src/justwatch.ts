import axios from "axios";
import { isEqual } from "lodash";
import * as scb from "./scb";
import { Movie } from "./types";

interface JWMovie {
  id: number;
  objectType: "MOVIE";
  objectId: number;
  content: {
    fullPath: string;
    title: string;
    originalReleaseYear: number;
  }
}

export async function fetchMissingJWData() {
  console.log("Filling any missing JustWatch data");

  const movies = await scb.readMovieRankings();
  const patches = await scb.readScbPatches();

  try {
    let i = 1, pendingWrites = 0;
    for (const movie of movies) {
      const matchingPatch = patches.find(p => isEqual(p.id, movie.id) || isEqual(p.scbKey, movie.id));
      if (hasMissingJWData(movie, matchingPatch)) {
        let jwMovie: JWMovie | 'not-found';
        try {
          jwMovie = await findMatchingMovie(movie);
        } catch (e) {
          console.error(`  - Error while searching ${JSON.stringify(movie.id)} with IMDB ID ${movie.tconst}`);
          console.error(`    ${e.message}`);
          i++;
          continue;
        }

        if (jwMovie !== 'not-found') {
          movie.jwId = jwMovie.id;
          movie.jwFullPath = jwMovie.content.fullPath;

          if (++pendingWrites % 50 === 0) {
            await scb.writeMovieRankings(movies);
            pendingWrites = 0;
          }
          console.log(` - ${i}/${movies.length}: OK for ${movie.title}`);
        } else {
          console.log(` - ${i}/${movies.length}: ${movie.title} not found in JustWatch`);
          console.log('   ' + JSON.stringify(movie.id));
          console.log('   (Add scb_patch.json entry with "jwMissing" set to true to ignore)');
        }
      }
      i++;
    }

    await scb.writeMovieRankings(movies);
  } catch (e) {
    if (e.statusCode === 401) {
      // Untested
      const missingMovies = movies.filter(r => !r.tmdbId);
      console.warn(`  SKIPPED: JW request limit reached :(  ${missingMovies} movies yet to be matched.`);
      if (missingMovies.length < 100) {
        console.warn(`  Missing movies: ${missingMovies.map(m => m.tconst).join(' ')}`);
      }
      await scb.writeMovieRankings(movies);
    } else {
      throw e;
    }
  }
}

async function findMatchingMovie(movie: Movie): Promise<JWMovie | 'not-found'> {
  if (!movie.tmdbId) {
    throw new Error('TMDB ID is required');
  }

  const foundMovies = await searchMovies(movie.title);
  const matchingMovie = foundMovies?.find(item => item.id === movie.tmdbId);
  return matchingMovie || 'not-found';
}

export async function searchMovies(title: string): Promise<JWMovie[] | undefined> {
  const response = await axios.post('https://apis.justwatch.com/graphql', {
    "operationName": "GetSuggestedTitles",
    "variables": {
      "country": "FR",
      "language": "fr",
      "first": 2,
      "filter": {
        "searchQuery": title,
        "includeTitlesWithoutUrl": false
      }
    },
    "query": "query GetSuggestedTitles($country: Country!, $language: Language!, $first: Int!, $filter: TitleFilter) { popularTitles(country: $country, first: $first, filter: $filter) { edges { node {...SuggestedTitle}}}} fragment SuggestedTitle on MovieOrShow {id objectType objectId content(country: $country, language: $language) {fullPath title originalReleaseYear}}"
  });

  return response.data.data.popularTitles.edges.map(edge => edge.node);
}

export function invalidateJWData(movie: Movie) {
  delete movie.jwId;
  delete movie.jwFullPath;
  delete movie.jwMissing;
}

function hasMissingJWData(movie: Movie, patch?: scb.MoviePatch) {
  if (!movie.tmdbId) {
    return false;
  }
  if (patch?.jwId || patch?.jwMissing) {
    return false;
  }
  return !movie.jwId
    || !movie.jwFullPath;
}
