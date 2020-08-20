
import * as scb from "./src/scb";

(async () => {
  try {
    if (process.env.SCB_INIT) {  
      await scb.importMovieRankings();
    }
    await scb.matchMoviesWithIMDB();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
