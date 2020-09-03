
import * as imdb from "./src/imdb";
import * as omdb from "./src/omdb";
import * as patch from "./src/patch";
import * as scb from "./src/scb";

(async () => {
  try {
    if (process.env.SCB_INIT) {  
      await scb.scrapeMovieRankings();
      await scb.scrapeScbEpisodes();
    } else {
      console.log("Skipping Super Cine Battle scraping (use SCB_INIT=true to enable)")
    }

    const movies = await scb.readMovieRankings();
    if (movies.length < 1000) {
      throw new Error(`Only ${movies.length} movies read. Try launching again.`); // FIXME Occasional file read issue
    }

    await imdb.synchronizeWithIMDB();
    await omdb.synchronizeWithOMDB();
    await patch.patchMovies();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
