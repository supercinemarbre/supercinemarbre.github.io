import { isUrlBroken } from "./src/checkUrl";
import { invalidateOMDBData } from "./src/omdb";
import * as scb from "./src/scb";

(async () => {
  const movies = await scb.readMovieRankings();

  for (const movie of movies) {
    const testUrl = await isUrlBroken(movie.posterUrl);
    if (testUrl){
      console.log(movie.title);
      invalidateOMDBData(movie);
    }
  }
  await scb.writeMovieRankings(movies);
})();