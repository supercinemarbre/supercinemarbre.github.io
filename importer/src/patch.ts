import { readData } from "./io";
import * as scb from "./scb";

export async function patchMovieRankings(): Promise<void> {
  console.log("Patching movie data");

  const movies = await scb.readMovieRankings() || [];

  for (const movie of movies) {
    movie.directors = await patchPersons(movie.directors);
    movie.writers = await patchPersons(movie.writers);
    movie.actors = await patchPersons(movie.actors);
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
