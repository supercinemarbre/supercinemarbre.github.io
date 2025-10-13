import { readFileSync, writeFileSync } from "fs";

const scbPatch = JSON.parse(readFileSync("./data/scb_patch.json.bak").toString());
const timestampsPatch = JSON.parse(
  readFileSync("./data/timestamps_patch.json.bak").toString()
);

let moviesPatch = scbPatch;
timestampsPatch.forEach((patch) => {
  const match = moviesPatch.find(
    (movie) =>
      idsMatch(movie.id, patch.id) ||
      idsMatch(movie.id, patch.gsheetsKey) ||
      idsMatch(movie.scbKey, patch.gsheetsKey) ||
      (movie.tconst && movie.tconst === patch.tconst)
  );
  if (match) {
    Object.assign(match, patch);
  } else {
    moviesPatch.push(patch);
  }
});

moviesPatch.forEach((movie) => {
    if (movie.scbKey && !movie.id) {
        movie.id = movie.scbKey;
        delete movie.scbKey;
    }
    if (movie.gsheetsKey && !movie.id) {
        movie.id = movie.gsheetsKey;
        delete movie.gsheetsKey;
    }
});


moviesPatch.forEach((movie) => {
    if (!movie.id) {
        console.warn("No id found for movie:", movie);
    }
});

moviesPatch = moviesPatch.sort((a, b) => (b.id?.episode || 0) - (a.id?.episode || 0) )

writeFileSync('./data/movie_patch.json', JSON.stringify(moviesPatch, null, 2));

function idsMatch(id1, id2) {
  return id1 && id2 && id1.episode === id2.episode && id1.name === id2.name;
}
