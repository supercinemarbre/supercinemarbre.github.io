import { readScbRankings, writeScbRankings } from "./src/data";

const movieNames = process.argv.slice(2)
  .map(movieName => movieName.replace(/'/g, '’'));

console.log(`Invalidating ${movieNames.join(', ')}...`);

(async () => {
  const movies = await readScbRankings();
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
    await writeScbRankings(movies);
    console.log("Done");
  } else {
    const notFound = movieNames.filter(movieName => !found.includes(movieName));
    console.error(`Movie not found: ${notFound.join(', ')}`);
  }
})();
