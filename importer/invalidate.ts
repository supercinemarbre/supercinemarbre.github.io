import * as scb from "./src/scb";
import * as imdb from "./src/imdb";
import * as omdb from "./src/omdb";

const movieNames = process.argv.slice(2)
  .map(movieName => movieName.replace(/'/g, '’'));

console.log(`Invalidating ${movieNames.join(', ')}...`);

const partialInvalidation = process.env.IMDB_ONLY || process.env.OMDB_ONLY;

(async () => {
  const movies = await scb.readMovieRankings();

  const moviesToInvalidate = movies.filter(movie => movieNames.includes(movie.scbTitle) || process.env.ALL);

  for (const movie of moviesToInvalidate) {
    // IMDB
    if (!partialInvalidation || process.env.IMDB_ONLY) {
      imdb.invalidateIMDBData(movie);
    }
    // OMDB
    if (!partialInvalidation || process.env.OMDB_ONLY) {
      omdb.invalidateOMDBData(movie);
    }
  }

  if (moviesToInvalidate.length === movieNames.length || process.env.ALL) {
    await scb.writeMovieRankings(movies);
    console.log(`Done (invalidated ${moviesToInvalidate.length} movies)`);
  } else {
    const movieNames = moviesToInvalidate.map(movie => movie.scbTitle);
    const notFound = movieNames.filter(movieName => !movieNames.includes(movieName));
    console.error(`ERROR: Movie(s) not found: ${notFound.join(', ')}`);
  }
})();
