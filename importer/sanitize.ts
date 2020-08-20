import { readScbRankings, writeScbRankings } from "./src/data";

(async () => {
  const movies = await readScbRankings();

  for (const movie of movies) {
    if (Math.abs(movie.startYear - parseInt(movie.decade, 10)) > 10) {
      delete movie.tconst;
      delete movie.startYear;
      delete movie.primaryTitle;
    }
  }

  await writeScbRankings(movies);
})();
