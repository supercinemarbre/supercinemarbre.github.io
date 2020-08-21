import * as scb from "./src/scb";

const movieNames = process.argv.slice(2)
  .map(movieName => movieName.replace(/'/g, '’'));

console.log(`Invalidating ${movieNames.join(', ')}...`);

(async () => {
  const movies = await scb.readMovieRankings();
  let found = [];

  for (const movie of movies) {
    if (movieNames.includes(movie.scbTitle)) {
      found.push(movie.scbTitle);
      delete movie.tconst;
      delete movie.primaryTitle;
      delete movie.startYear;
    }
  }

  if (found.length === movieNames.length) {
    await scb.writeMovieRankings(movies);
    console.log("Done");
  } else {
    const notFound = movieNames.filter(movieName => !found.includes(movieName));
    console.error(`Movie not found: ${notFound.join(', ')}`);
  }
})();
