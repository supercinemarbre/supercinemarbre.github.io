import { isEqual } from "lodash";
import { readData } from "./io";
import { Movie, MovieID } from "./types";
import { idsMatch } from "./utils/ids-match";

export type MoviePatch = Partial<Movie> & { gsheetsKey: MovieID; forceImport?: boolean; };

export async function gsheetsKeyToId(gsheetsKey: MovieID): Promise<MovieID> {
  const patches = await readMoviePatches();
  return patches.find(p => idsMatch(gsheetsKey, p.gsheetsKey))?.id ?? gsheetsKey;
}

export async function mustForceImport(id: MovieID): Promise<boolean> {
  const patches = await readMoviePatches();
  return patches.find(p => idsMatch(id, p.id))?.forceImport ?? false;
}

export async function patchMovies(movies: Movie[]): Promise<Movie[]> {
  console.log("Patching movie data");

  const patch = await readMoviePatches();

  for (const movie of movies) {

    const matchingPatch = patch.find(p => isEqual(p.id, movie.id));
    if (matchingPatch) {
      Object.assign(movie, matchingPatch);
    }
  }

  return movies;
}

export async function patchMoviePersons(movies: Movie[]): Promise<Movie[]> {
  console.log("Normalizing movie data");

  for (const movie of movies) {
    movie.directors = await patchPersons(movie.directors);
    movie.writers = await patchPersons(movie.writers);
    movie.actors = await patchPersons(movie.actors);
  }

  return movies;
}

async function patchPersons(persons: string[]) {
  const personPatch = await readPersonPatch();
  return persons?.map(person => personPatch[person] || person);
}

let moviePatchesCache: MoviePatch[] | undefined;
async function readMoviePatches(): Promise<MoviePatch[]> {
  if (moviePatchesCache === undefined) {
    const patches = await readData("movie_patch.json", []);
    if (Array.isArray(patches)) {
      moviePatchesCache = patches;
    } else {
      moviePatchesCache = Object.values(patches); // XXX Array is sometimes parsed as object
    }
  }
  return moviePatchesCache;
}

let personPatchCache: Record<string, string> | undefined;
async function readPersonPatch(): Promise<Record<string, string>> {
  if (!personPatchCache) {
    personPatchCache = await readData("person_patch.json");
  }
  return personPatchCache;
}
