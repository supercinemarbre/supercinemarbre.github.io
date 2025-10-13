import download from "download";
import { readApiKey, readData } from "./io";
import { Movie } from "./types";

const OMDB_API_KEY = readApiKey("omdbapikey");

interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string; // eg. "31 Mar 1999"
  Runtime: string; // eg. "136 min",
  Genre: string; // comma-separated
  Director: string; // comma-separated
  Writer: string; // comma-separated
  Actors: string; // comma-separated
  Plot: string;
  Language: string;
  Country: string; // comma-separated?
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string; // eg. "8.7"
  imdbVotes: string; // eg. "1,624,177"
  imdbID: string;
  Type: string;
  DVD: string; // eg. "21 Sep 1999"
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: "True" | any;
}

export async function applyMissingOMDBData(movies?: Movie[]) {
  console.log("Filling any missing OMDB data");

  if (!OMDB_API_KEY) {
    console.log(`
    Cannot synchronize with OMDB, an API key must first be set in the importer data/ directory, in a file called "omdbapikey".
    You can get a free key at http://www.omdbapi.com.
    Or, you can use the "Examples" tool on the front page and copy/paste the movies by hand in data/omdb_dump.json.`);
    return;
  }

  const omdbDump = await readOMDBDump();

  try {
    let movieIndex = 1;
    for (const movie of movies) {
      if (hasMissingOMDBData(movie)) {
        let omdbMovie = omdbDump.find((m) => m.imdbID === movie.tconst);
        if (!omdbMovie && movie.tconst) {
          const omdbString = await download(
            `http://www.omdbapi.com/?i=${movie.tconst}&apikey=${OMDB_API_KEY}`
          );
          try {
            omdbMovie = JSON.parse(omdbString.toString()) as OmdbMovie;
          } catch (e) {
            console.error(
              `  - Error while searching ${JSON.stringify(
                movie.id
              )} with IMDB ID ${movie.tconst}`
            );
            console.error(`    ${omdbString.toString()}`);
            movieIndex++;
            continue;
          }
        }

        if (omdbMovie?.Response === "True") {
          Object.keys(omdbMovie).forEach((key) => {
            if (omdbMovie[key] === "N/A") {
              omdbMovie[key] = "";
            }
          });

          movie.year = movie.year ?? parseInt(omdbMovie.Year, 10);
          movie.runtimeMinutes =
            movie.runtimeMinutes ?? omdbMovie.Runtime.split(" ")[0];
          movie.posterUrl = movie.posterUrl ?? omdbMovie.Poster;

          movie.imdbRating =
            movie.imdbRating ?? parseFloat(omdbMovie.imdbRating);
          movie.imdbVotes =
            movie.imdbVotes ?? parseInt(omdbMovie.imdbVotes.replace(/,/g, ""));
          movie.metascore =
            movie.metascore ??
            (omdbMovie.Metascore
              ? parseInt(omdbMovie.Metascore, 10)
              : undefined);
          const rottenTomatoesRating = omdbMovie.Ratings.find(
            (r) => r.Source === "Rotten Tomatoes"
          )?.Value;
          movie.rottenTomatoesRating =
            movie.rottenTomatoesRating ?? rottenTomatoesRating
              ? parseInt(rottenTomatoesRating, 10)
              : undefined;

          movie.usaRating =
            movie.usaRating ??
            (omdbMovie.Rated !== "N/A" ? omdbMovie.Rated : undefined);
          movie.directors = movie.directors ?? omdbMovie.Director.split(", ");
          movie.writers = movie.writers ?? omdbMovie.Writer.split(", ");
          movie.actors = movie.actors ?? omdbMovie.Actors.split(", ");
          movie.production =
            movie.production ??
            (omdbMovie.Production !== "N/A" ? omdbMovie.Production : undefined);

          if (omdbMovie.Released && !movie.releaseDate) {
            const releaseDateWithOffset = new Date(omdbMovie.Released);
            const releaseDate = new Date(
              releaseDateWithOffset.getTime() -
                releaseDateWithOffset.getTimezoneOffset() * 60000
            );
            movie.releaseDate = releaseDate.toISOString();
          }
          movie.countries = movie.countries ?? omdbMovie.Country.split(", ");
          movie.languages = movie.languages ?? omdbMovie.Language.split(", ");
          movie.genres = movie.genres ?? omdbMovie.Genre.split(", ");
          console.log(
            ` - ${movieIndex}/${movies.length}: OK for ${movie.title}`
          );
        } else {
          console.log(
            ` - ${movieIndex}/${movies.length}: ${movie.title} not found in OMDB`
          );
        }
      }
      movieIndex++;
    }
    return movies;
  } catch (e) {
    if (e.statusCode === 401) {
      console.warn("  SKIPPED: Daily OMDB limit reached :(");
      const missingMovies = movies.filter((r) => !r.posterUrl);
      const missingMoviesDetails =
        missingMovies.length > 100
          ? `${missingMovies.length} movies`
          : missingMovies.map((m) => m.tconst).join(" ");
      console.warn(`  Missing movies: ${missingMoviesDetails}`);
      console.warn(
        "  If you're in a hurry you can get them manually at http://www.omdbapi.com/ and put them in omdb_dump.json"
      );
      return movies;
    } else {
      throw e;
    }
  }
}

export function invalidateOMDBData(movie: Movie) {
  delete movie.year;
  delete movie.runtimeMinutes;
  delete movie.posterUrl;
  delete movie.imdbRating;
  delete movie.imdbVotes;
  delete movie.metascore;
  delete movie.rottenTomatoesRating;
  delete movie.usaRating;
  delete movie.directors;
  delete movie.writers;
  delete movie.actors;
  delete movie.production;
  delete movie.countries;
  delete movie.languages;
  delete movie.genres;
}

function hasMissingOMDBData(movie: Movie) {
  return !movie.year || !movie.posterUrl;
}

async function readOMDBDump(): Promise<OmdbMovie[]> {
  const dumpObject = await readData<Record<string, OmdbMovie>>(
    "omdb_dump.json"
  );
  return Object.values(dumpObject);
}
