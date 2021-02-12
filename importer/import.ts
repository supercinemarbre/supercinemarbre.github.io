
import * as googleSheets from "./src/google-sheets";
import * as imdb from "./src/imdb";
import * as justWatch from "./src/justwatch";
import * as omdb from "./src/omdb";
import * as patch from "./src/patch";
import * as scb from "./src/scb";
import * as timestamps from "./src/timestamps";
import * as tmdb from "./src/tmdb";

(async () => {
  try {

    // Episode timestamps

    if (process.env.GSHEETS_INIT) {
      await googleSheets.refreshTimestampFiles();
    } else {
      console.log("Skipping fetching timestamps from Google Sheets (use GSHEETS_INIT=true to enable)")
    }
    await timestamps.importTimestampsRankingsAndMissingMovies();

    // Super Cine Battle episodes

    if (process.env.SCB_INIT) {
      await scb.scrapeScbEpisodes();
    }

    // IMDB/OMDB data fetching

    await imdb.fetchMissingIMDBData();
    await omdb.fetchMissingOMDBData();
    await tmdb.fetchMissingTMDBData();
    await justWatch.fetchMissingJWData();

    // Patching of final results

    await patch.patchMovies();
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
