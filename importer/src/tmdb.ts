import download from "download";
import { readApiKey } from "./io";
import * as scb from "./scb";
import { Movie } from "./types";

const TMDB_API_KEY = readApiKey("tmdbapikey");

interface TmdbResults {
  movie_results: TmdbMovie[];
}

interface TmdbMovie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  poster_path: string;
  release_date: string; // YYYY-MM-DD
  video: boolean;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export async function fetchMissingTMDBData(movies: Movie[]): Promise<Movie[]> {
  console.log("Filling any missing TMDB data");

  if (!TMDB_API_KEY) {
    console.log(`
    Skipping synchronization with TMDB.
    An API key must first be set in the importer data/ directory, in a file called "tmdbapikey".
    You can request a free key at https://www.themoviedb.org.`);
    return;
  }

  try {
    let movieIndex = 1;
    for (const movie of movies) {
      if (hasMissingTMDBData(movie)) {
        let tmdbResults: TmdbResults;

        if (movie.tconst) {
          const tmdbString = await download(`https://api.themoviedb.org/3/find/${movie.tconst}?api_key=${TMDB_API_KEY}`
            + '&language=fr-FR&external_source=imdb_id&type=movie');
          try {
            tmdbResults = JSON.parse(tmdbString.toString()) as TmdbResults;
            if (tmdbResults?.movie_results?.length !== 1) {
              throw new Error(`Unexpected result count: ${tmdbResults?.movie_results?.length}`);
            }
          } catch (e) {
            console.error(`  - Error while searching ${JSON.stringify(movie.id)} with IMDB ID ${movie.tconst}`);
            console.error(`    ${tmdbString.toString()}`);
            movieIndex++;
            continue;
          }
        }

        if (tmdbResults?.movie_results?.length === 1) {
          const tmdbMovie = tmdbResults.movie_results[0];

          movie.tmdbId = tmdbMovie.id;
          movie.tmdbVoteAverage = tmdbMovie.vote_average;

          console.log(` - ${movieIndex}/${movies.length}: OK for ${movie.title}`);
        } else {
          console.log(` - ${movieIndex}/${movies.length}: ${movie.title} not found in TMDB`);
        }
      }
      movieIndex++;
    }

    return movies;
  } catch (e) {
    if (e.statusCode === 401) {
      // Untested
      const missingMovies = movies.filter(r => !r.tmdbId);
      console.warn(`  SKIPPED: TMDB request limit reached :(  ${missingMovies} movies yet to be matched.`);
      if (missingMovies.length < 100) {
        console.warn(`  Missing movies: ${missingMovies.map(m => m.tconst).join(' ')}`);
      }

    return movies;
    } else {
      throw e;
    }
  }
}

export function hasMissingTMDBData(movie: Movie) {
  return !movie.tmdbId;
}

export function invalidateTMDBData(movie: Movie) {
  delete movie.tmdbId;
  delete movie.tmdbVoteAverage;
}
