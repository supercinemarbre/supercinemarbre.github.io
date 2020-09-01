import * as scb from "./src/scb";

const movieNames = process.argv.slice(2)
  .map(movieName => movieName.replace(/'/g, '’'));

console.log(`Invalidating ${movieNames.join(', ')}...`);

const selective = process.env.IMDB_ONLY || process.env.OMDB_ONLY;

(async () => {
  const movies = await scb.readMovieRankings();

  const moviesToInvalidate = movies.filter(movie => movieNames.includes(movie.scbTitle) || process.env.ALL);

  for (const movie of moviesToInvalidate) {
    // IMDB
    if (!selective || process.env.IMDB_ONLY) {
      delete movie.tconst;
      delete movie.primaryTitle;
      delete movie.startYear;
    }
    // OMDB
    if (!selective || process.env.OMDB_ONLY) {
      delete movie.imdbRating;
      delete movie.posterUrl;
      delete movie.directors;
      delete movie.writers;
      delete movie.actors;
      delete movie.countries;
      delete movie.languages;
      delete movie.usaRating;
      delete movie.production;
      delete movie.genres;
      // TMP
      delete (movie as any).country;
      delete (movie as any).language;
    }
  }

  if (moviesToInvalidate.length === movieNames.length || process.env.ALL) {
    await scb.writeMovieRankings(movies);
    console.log(`Done (invalidated ${moviesToInvalidate.length} movies)`);
  } else {
    const movieNames = moviesToInvalidate.map(movie => movie.scbTitle);
    const notFound = movieNames.filter(movieName => !movieNames.includes(movieName));
    console.error(`Movie not found: ${notFound.join(', ')}`);
  }
})();
