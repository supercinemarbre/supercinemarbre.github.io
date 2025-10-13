
import * as googleSheets from "./src/google-sheets";
import * as imdb from "./src/imdb";
import * as justWatch from "./src/justwatch";
import * as omdb from "./src/omdb";
import * as patch from "./src/movie-patch";
import * as scb from "./src/scb";
import * as timestamps from "./src/timestamps";
import * as tmdb from "./src/tmdb";

(async () => {
  try {
    // Episode timestamps

    await googleSheets.refreshTimestampFiles();
    await timestamps.importTimestampsRankingsAndMissingMovies();

    // Super Cine Battle episodes

    await scb.scrapeScbEpisodes();

    // Movie metadata

    let movies = await scb.readMovieRankings();
    movies = await patch.applyMoviePatches(movies);

    movies = await imdb.applyMissingIMDBData(movies);
    movies = await omdb.applyMissingOMDBData(movies);
    movies = await tmdb.applyMissingTMDBData(movies);
    movies = await justWatch.applyMissingJWData(movies);

    movies = await patch.applyMoviePatches(movies); // Require for persons
    await scb.writeMovieRankings(movies);
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
