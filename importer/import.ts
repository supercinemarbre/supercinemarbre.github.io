
import * as imdb from "./src/imdb";
import * as omdb from "./src/omdb";
import * as patch from "./src/patch";
import * as scb from "./src/scb";
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

    try {
      // await omdb.synchronizeWithOMDB();
    } catch (e) {
      console.error(e); // Will fail with a 401 when key reaches OMDB limit
    }

    await patch.patchMovieRankings();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
