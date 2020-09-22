
import * as googleSheets from "./src/google-sheets";
import * as imdb from "./src/imdb";
import * as omdb from "./src/omdb";
import * as patch from "./src/patch";
import * as scb from "./src/scb";
import * as timestamps from "./src/timestamps";

(async () => {
  try {

    // Super Cine Battle lists

    if (process.env.SCB_INIT) {
      await scb.scrapeMovieRankings();
      await scb.scrapeScbEpisodes();
    } else {
      console.log("Skipping Super Cine Battle scraping (use SCB_INIT=true to enable)")
    }

    // Episode timestamps

    if (process.env.GSHEETS_INIT) {
      await googleSheets.refreshTimestampFiles();
    } else {
      console.log("Skipping fetching timestamps from Google Sheets (use GSHEETS_INIT=true to enable)")
    }
    await timestamps.collectTimestamps();

    // IMDB/OMDB data fetching

    await imdb.synchronizeWithIMDB();
    await omdb.synchronizeWithOMDB();

    // Patching of final results

    await patch.patchMovies();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
