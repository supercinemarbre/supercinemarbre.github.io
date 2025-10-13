import axios from "axios";
import { isEqual } from "lodash";
import * as scb from "./scb";
import { Movie } from "./types";
import { readMoviePatches } from "./movie-patch";

interface JWMovie {
  id: string;
  objectType: "MOVIE";
  objectId: number;
  content: {
    fullPath: string;
    title: string;
    originalReleaseYear: number;
    externalIds: {
      imdbId: string;
    }
  }
}

export async function applyMissingJWData(movies: Movie[]): Promise<Movie[]> {
  console.log("Filling any missing JustWatch data");

  try {
    let movieIndex = 1;
    for (const movie of movies) {
      if (hasMissingJWData(movie)) {
        let jwMovie: JWMovie | 'not-found';
        try {
          jwMovie = await findMatchingMovie(movie);
        } catch (e) {
          console.error(`  - Error while searching ${JSON.stringify(movie.id)} with IMDB ID ${movie.tconst}`);
          console.error(`    ${e.message}`);
          movieIndex++;
          continue;
        }

        if (jwMovie !== 'not-found') {
          movie.jwId = movie.jwId ?? jwMovie.objectId;
          movie.jwFullPath = movie.jwFullPath ?? jwMovie.content.fullPath;
          console.log(` - ${movieIndex}/${movies.length}: OK for ${movie.title}`);
        } else {
          console.log(` - ${movieIndex}/${movies.length}: ${movie.title} not found in JustWatch`);
          console.log('   ' + JSON.stringify(movie.id));
          console.log('   (Add movie_patch.json entry with "jwMissing" set to true to ignore)');
        }
      }
      movieIndex++;
    }

    return movies;
  } catch (e) {
    if (e.statusCode === 401) {
      // Untested
      const missingMovies = movies.filter(r => !r.jwId);
      const missingMoviesDetails =
        missingMovies.length > 100
          ? `${missingMovies.length} movies`
          : missingMovies.map((m) => m.tconst).join(" ");
      console.warn(`  SKIPPED: JW request limit reached :(  ${missingMovies} movies yet to be matched.`);
      console.warn(`  Missing movies: ${missingMoviesDetails}`);
      return movies;
    } else {
      throw e;
    }
  }
}

async function findMatchingMovie(movie: Movie): Promise<JWMovie | 'not-found'> {
  if (!movie.tconst) {
    throw new Error('IMDB ID is required');
  }

  const foundMovies = await searchMovies(movie.primaryTitle || movie.title);
  const matchingMovie = foundMovies?.find(item => item.content.externalIds.imdbId === movie.tconst);
  console.log(movie, matchingMovie);
  return matchingMovie || 'not-found';
}

export async function searchMovies(title: string): Promise<JWMovie[] | undefined> {
  const response = await axios.post('https://apis.justwatch.com/graphql', {
    "operationName": "GetSuggestedTitles",
    "variables": {
      "country": "FR",
      "language": "fr",
      "first": 5,
      "filter": {
        "searchQuery": title,
        "includeTitlesWithoutUrl": true
      }
    },
    "query": "query GetSuggestedTitles($country: Country!, $language: Language!, $first: Int!, $filter: TitleFilter) { popularTitles(country: $country, first: $first, filter: $filter) { edges { node {...SuggestedTitle}}}} fragment SuggestedTitle on MovieOrShow {id objectType objectId content(country: $country, language: $language) {fullPath title originalReleaseYear externalIds {imdbId}}}"
  });

  return response.data.data.popularTitles.edges.map(edge => edge.node);
}

export function invalidateJWData(movie: Movie) {
  delete movie.jwId;
  delete movie.jwFullPath;
  delete movie.jwMissing;
}

function hasMissingJWData(movie: Movie) {
  if (!movie.tconst) { // Movies without IMDB ID are not supported
    return false;
  }
  if (movie?.jwId || movie?.jwMissing) {
    return false;
  }
  return !movie.jwId
    || !movie.jwFullPath;
}
