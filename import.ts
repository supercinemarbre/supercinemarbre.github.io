
import * as scb from "./src/scb";

(async () => {
  try {
    //await scb.importMovieRankings();
    await scb.matchMoviesWithIMDB();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
