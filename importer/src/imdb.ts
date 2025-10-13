import download from "download";
import * as timestamps from "./timestamps";
import { Movie } from "./types";
import { assignMissing } from "./utils/assign-missing";

export interface ImdbMovie {
  tconst: string;
  primaryTitle: string;
}

export async function applyMissingIMDBData(movies?: Movie[]): Promise<Movie[]> {
  console.log("Filling any missing IMDB data");
  const timestampPatches = await timestamps.readTimestampsPatches();

  let movieIndex = 1;
  for (const movie of movies) {
    if (hasMissingIMDBData(movie)) {
      const imdbSuggestionOptions =
        "imdbType" in movie
          ? { acceptTypes: [movie?.imdbType] }
          : undefined;
        console.log(movie, imdbSuggestionOptions)
      let imdbMovie: ImdbMovie = await getIMDBSuggestion(
        movie?.tconst || movie.title,
        imdbSuggestionOptions
      );

      if (!imdbMovie) {
        console.log(
          ` - ${movieIndex}/${movies.length}: No match found for ${movie.id.episode} ${movie.id.name}`
        );
      } else {
        console.log(` - ${movieIndex}/${movies.length}: OK for ${movie.title}`);
        assignMissing(movie, imdbMovie);
      }
    }
    movieIndex++;
  }

  return movies;
}

async function getIMDBSuggestion(
  titleOrTconst: string,
  options?: { acceptTypes?: string[] }
): Promise<ImdbMovie | undefined> {
  try {
    const searchString = titleOrTconst
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);
    const imdbUrl = `https://v2.sg.media-imdb.com/suggestion/${searchString[0]}/${searchString}.json`;
    const resultString = await download(imdbUrl);
    const result = JSON.parse(resultString.toString()) as {
      d: Array<{
        i: {
          imageUrl: string;
        };
        q: "feature" | string; // type
        l: string; // title
        id: string; // tconst
      }>;
    };
    if (result.d) {
      const movies = result.d.filter((r) =>
        (options?.acceptTypes ?? ["feature", "TV movie"]).includes(r.q)
      );
      if (movies.length > 0) {
        const suggestion = movies[0];
        return {
          tconst: suggestion.id,
          primaryTitle: suggestion.l,
        };
      }
    }
  } catch (e) {
    console.warn(
      `Failed to search ${titleOrTconst} on IMDB suggestions endpoint`
    );
  }
}

export function invalidateIMDBData(movie: Movie) {
  delete movie.tconst;
  delete movie.primaryTitle;
}

function hasMissingIMDBData(movie: Movie) {
  return !movie.tconst || !movie.primaryTitle
}
