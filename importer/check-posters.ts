import { isUrlBroken } from "./src/checkUrl";
import { invalidateIMDBData } from "./src/imdb";
import { invalidateOMDBData } from "./src/omdb";
import * as scb from "./src/scb";

(async () => {
  const movies = await scb.readMovieRankings();

  for (const movie of movies) {
    const testUrl = await isUrlBroken(movie.posterUrl);
    if (testUrl){
      console.log(movie.title);
      invalidateIMDBData(movie);
    }
  }
  await scb.writeMovieRankings(movies);
})();