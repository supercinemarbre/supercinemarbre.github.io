
import * as scb from "./src/scb";
import * as imdb from "./src/imdb";
import * as omdb from "./src/omdb";
import { Movie } from "./src/types";

(async () => {
  try {
    let movies: Movie[];
    if (process.env.SCB_INIT) {  
      await scb.importMovieRankings();
    } else {
      movies = await scb.readMovieRankings();
    }

    if (movies.length < 1000) {
      throw new Error(`Only ${movies.length} movies read. Try launching again.`); // FIXME Occasional file read issue
    }

    await imdb.synchronizeWithIMDB();
    await omdb.synchronizeWithOMDB();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
