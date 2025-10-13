import * as scb from "./src/scb";

const movieNames = process.argv.slice(2);

(async () => {
  const movies = await scb.readMovieRankings();

  for (const movieName of movieNames) {
    const matches = movies.filter(
      (movie) =>
        movie.id.name === movieName ||
        movie.id.name === movieName.replace(/'/g, "’") ||
        process.env.ALL
    );

    console.log(
      `Found ${matches.length} match${matches.length !== 1 ? "es" : ""}:`
    );
    for (const movie of matches) {
      console.log(JSON.stringify(movie, null, 2));
    }
  }
})();
