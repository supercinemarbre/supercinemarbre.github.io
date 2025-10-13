import { isEqual } from "lodash";
import { readData } from "./io";
import * as scb from "./scb";
import { Movie } from "./types";

export async function applyMoviePatches(movies: Movie[]): Promise<Movie[]> {
  console.log("Patching movie data");

  const patch = await readMoviePatches() || [];

  for (const movie of movies) {
    movie.directors = await patchPersons(movie.directors);
    movie.writers = await patchPersons(movie.writers);
    movie.actors = await patchPersons(movie.actors);

    const matchingPatch = patch.find(p => isEqual(p.id, movie.id));
    if (matchingPatch && typeof matchingPatch === 'object') {
      Object.assign(movie, matchingPatch);
    }
  }

  return movies;
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

export async function readMoviePatches(): Promise<scb.MoviePatch[]> {
  const patches = await readData("movie_patch.json");
  if (Array.isArray(patches)) {
    return patches;
  } else {
    return Object.values(patches); // XXX Array is sometimes parsed as object
  }
}
