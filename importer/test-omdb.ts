
import * as omdb from "./src/omdb";
import * as scb from "./src/scb";

(async () => {
  try {
    const movies = await scb.readMovieRankings();
    const testMovie = movies.filter(movie => movie.primaryTitle === "The Matrix");
    await omdb.synchronizeWithOMDB(testMovie);
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
