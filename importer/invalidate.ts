import { readScbRankings, writeScbRankings } from "./src/data";

const movieName = process.argv[2];

console.log(`Invalidating ${movieName}...`);

(async () => {
  const movies = await readScbRankings();
  let found = false;

  for (const movie of movies) {
    if (movie.scbTitle === movieName) {
      found = true;
      delete movie.tconst;
      delete movie.primaryTitle;
      delete movie.startYear;
    }
  }

  if (found) {
    await writeScbRankings(movies);
    console.log("Done");
  } else {
    console.error("Movie not found");
  }
})();
