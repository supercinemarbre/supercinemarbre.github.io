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

    // IMDB/OMDB data fetching

    let movies = await scb.readMovieRankings();
    movies = await patch.patchMovies(movies);

    movies = await imdb.fetchMissingIMDBData(movies);
    movies = await omdb.fetchMissingOMDBData(movies);
    movies = await tmdb.fetchMissingTMDBData(movies);
    movies = await justWatch.fetchMissingJWData(movies);

    // Patching of final results

    movies = await patch.patchMoviePersons(movies);
    await scb.writeMovieRankings(movies);
  } catch (e) {
    console.error("ERROR: ", e, e.stack);
  }
})();
