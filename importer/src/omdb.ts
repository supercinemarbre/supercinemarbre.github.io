import download from "download";
import { readApiKey, readData } from "./io";
import * as scb from "./scb";
import { Movie } from "./types";
import { assignMissing } from "./utils/assign-missing";

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

export async function fetchMissingOMDBData(sublist?: Movie[]) {
  console.log("Filling any missing OMDB data");

  if (!OMDB_API_KEY) {
    console.log(`
    Cannot synchronize with OMDB, an API key must first be set in the importer data/ directory, in a file called "omdbapikey".
    You can get a free key at http://www.omdbapi.com.
    Or, you can use the "Examples" tool on the front page and copy/paste the movies by hand in data/omdb_dump.json.`);
    return;
  }

  const movies = sublist ?? await scb.readMovieRankings();
  const omdbDump = await readOMDBDump();

  try {
    let movieIndex = 1;
    for (const movie of movies) {
      if (hasMissingOMDBData(movie)) {
        let rawOmdbMovie = omdbDump.find(m => m.imdbID === movie.tconst);
        if (!rawOmdbMovie && movie.tconst) {
          const omdbString = await download(`http://www.omdbapi.com/?i=${movie.tconst}&apikey=${OMDB_API_KEY}`);
          try {
            rawOmdbMovie = JSON.parse(omdbString.toString()) as OmdbMovie;
          } catch (e) {
            console.error(`  - Error while searching ${JSON.stringify(movie.id)} with IMDB ID ${movie.tconst}`);
            console.error(`    ${omdbString.toString()}`);
            movieIndex++;
            continue;
          }
        }

        if (rawOmdbMovie?.Response === "True") {
          Object.keys(rawOmdbMovie).forEach(key => {
            if (rawOmdbMovie[key] === 'N/A') {
              rawOmdbMovie[key] = '';
            }
          });

          const omdbMovie: Partial<Movie> = {};

          omdbMovie.year = parseInt(rawOmdbMovie.Year, 10);
          omdbMovie.runtimeMinutes = rawOmdbMovie.Runtime.split(" ")[0];
          omdbMovie.posterUrl = rawOmdbMovie.Poster;

          omdbMovie.imdbRating = parseFloat(rawOmdbMovie.imdbRating);
          omdbMovie.imdbVotes = parseInt(rawOmdbMovie.imdbVotes.replace(/,/g, ''));
          omdbMovie.metascore = rawOmdbMovie.Metascore ? parseInt(rawOmdbMovie.Metascore, 10) : undefined;
          const rottenTomatoesRating = rawOmdbMovie.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value;
          omdbMovie.rottenTomatoesRating = rottenTomatoesRating ? parseInt(rottenTomatoesRating, 10) : undefined;

          omdbMovie.usaRating = rawOmdbMovie.Rated !== 'N/A' ? rawOmdbMovie.Rated : undefined;
          omdbMovie.directors = rawOmdbMovie.Director.split(', ');
          omdbMovie.writers = rawOmdbMovie.Writer.split(', ');
          omdbMovie.actors = rawOmdbMovie.Actors.split(', ');
          omdbMovie.production = rawOmdbMovie.Production !== 'N/A' ? rawOmdbMovie.Production : undefined;

          if (rawOmdbMovie.Released) {
            const releaseDateWithOffset = new Date(rawOmdbMovie.Released);
            const releaseDate = new Date(releaseDateWithOffset.getTime() - releaseDateWithOffset.getTimezoneOffset() * 60000);
            omdbMovie.releaseDate = releaseDate.toISOString();
          }
          omdbMovie.countries = rawOmdbMovie.Country.split(', ');
          omdbMovie.languages = rawOmdbMovie.Language.split(', ');
          omdbMovie.genres = rawOmdbMovie.Genre.split(', ');
          assignMissing(movie, omdbMovie);

          console.log(` - ${movieIndex}/${movies.length}: OK for ${movie.title}`);
        } else {
          console.log(` - ${movieIndex}/${movies.length}: ${movie.title} not found in OMDB`);
        }
      }
      movieIndex++;
    }

    return movies;
  } catch (e) {
    if (e.statusCode === 401) {
      console.warn("  SKIPPED: Daily OMDB limit reached :(");
      const missingMovies = movies.filter(r => !r.posterUrl);
      if (missingMovies.length < 100) {
        console.warn(`  Missing movies: ${missingMovies.map(m => m.tconst).join(' ')}`);
        console.warn("  If you're in a hurry you can get them manually at http://www.omdbapi.com/ and put them in omdb_dump.json");
      }

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
  return !movie.year ||
    !movie.posterUrl;
}

async function readOMDBDump(): Promise<OmdbMovie[]> {
  const dumpObject = await readData<Record<string, OmdbMovie>>("omdb_dump.json");
  return Object.values(dumpObject);
}
