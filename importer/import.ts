
import * as scb from "./src/scb";
import * as imdb from "./src/imdb";
import { Movie } from "./src/types";

(async () => {
  try {
    let movies: Movie[];
    if (process.env.SCB_INIT) {  
      movies = await scb.importMovieRankings();
    } else {
      movies = await scb.readMovieRankings();
    }

    if (movies.length < 1000) {
      throw new Error(`Only ${movies.length} movies read. Try launching again.`); // FIXME Occasional file read issue
    }

    await imdb.synchronizeWithIMDB(movies);
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
