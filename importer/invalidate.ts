import * as imdb from "./src/imdb";
import * as justWatch from "./src/justwatch";
import * as omdb from "./src/omdb";
import * as scb from "./src/scb";
import * as tmdb from "./src/tmdb";

const movieNames = process.argv.slice(2);

console.log(`Invalidating ${movieNames.join(', ')}...`);

const partialInvalidation = process.env.IMDB_ONLY || process.env.OMDB_ONLY;

(async () => {
  const movies = await scb.readMovieRankings();
  let invalidatedMovies = [];

  for (const movieName of movieNames) {
    const moviesToInvalidate = movies.filter(movie =>
        movie.id.name === movieName ||
        movie.id.name === movieName.replace(/'/g, '’') ||
        process.env.ALL);
    if (moviesToInvalidate.length === 0) {
      console.error(`ERROR: Movie not found: ${movieName}`);
      process.exit(1);
    }

    for (const movie of moviesToInvalidate) {
      // IMDB
      if (!partialInvalidation || process.env.IMDB_ONLY) {
        imdb.invalidateIMDBData(movie);
      }
      // OMDB
      if (!partialInvalidation || process.env.OMDB_ONLY) {
        omdb.invalidateOMDBData(movie);
      }
      // TMDB
      if (!partialInvalidation || process.env.TMDB_ONLY) {
        tmdb.invalidateTMDBData(movie);
      }
      // JustWatch
      if (!partialInvalidation || process.env.JW_ONLY) {
        justWatch.invalidateJWData(movie);
      }
      invalidatedMovies.push(movie);
    }
  }

  await scb.writeMovieRankings(movies);
  console.log(`Done (invalidated ${invalidatedMovies.length} movies)`);
})();
