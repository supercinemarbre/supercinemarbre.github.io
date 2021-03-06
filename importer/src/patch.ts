import { isEqual } from "lodash";
import { readData } from "./io";
import * as scb from "./scb";

export async function patchMovies(): Promise<void> {
  console.log("Patching movie data");

  const movies = await scb.readMovieRankings() || [];
  const patch = await scb.readScbPatches() || [];

  for (const movie of movies) {
    movie.directors = await patchPersons(movie.directors);
    movie.writers = await patchPersons(movie.writers);
    movie.actors = await patchPersons(movie.actors);

    const matchingPatch = patch.find(p => isEqual(p.id, movie.id));
    if (matchingPatch) {
      Object.assign(movie, matchingPatch);
    }
  }

  await scb.writeMovieRankings(movies);
}

async function patchPersons(persons: string[]) {
  const personPatch = await readPersonPatch();
  return persons?.map(person => personPatch[person] || person);
}

let personPatchCache: Record<string, string> | undefined;
async function readPersonPatch(): Promise<Record<string, string>> {
  if (!personPatchCache) {
    personPatchCache = await readData("person_patch.json");
  }
  return personPatchCache;
}
