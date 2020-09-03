import download from "download";
import * as data from "./io";
import * as scb from "./scb";
import { Movie } from "./types";

const OMDB_API_KEY = data.readApiKey();

interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string; // eg. "31 Mar 1999"
  Runtime: string; // eg. "136 min",
  Genre: string;// comma-separated
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

export async function synchronizeWithOMDB(sublist?: Movie[]) {
  console.log("Synchronizing rankings with OMDB");

  if (!OMDB_API_KEY) {
    console.log(`
    Cannot synchronize with OMDB, an API key must first be set in the importer data/ directory, in a file called "omdbapikey".
    You can get a free key at http://www.omdbapi.com.
    Or, you can use the "Examples" tool on the front page and copy/paste the movies by hand in data/omdb_dump.json.`);
    return;
  }

  const movies = sublist ?? await scb.readMovieRankings();
  const patch = await scb.readScbPatch();
  const omdbDump = await readOMDBDump();

  try {
    let i = 1, pendingWrites = 0;
    for (const movie of movies) {
      if (!movie.imdbRating) {
        let omdbMovie = omdbDump.find(m => m.imdbID === movie.tconst);
        if (!omdbMovie) {
          const omdbString = await download(`http://www.omdbapi.com/?i=${movie.tconst}&apikey=${OMDB_API_KEY}`);
          omdbMovie = JSON.parse(omdbString.toString()) as OmdbMovie;
        }

        if (omdbMovie.Response === "True") {
          Object.keys(omdbMovie).forEach(key => {
            if (omdbMovie[key] === 'N/A') {
              omdbMovie[key] = '';
            }
          });

          movie.posterUrl = omdbMovie.Poster;
          movie.imdbRating = parseFloat(omdbMovie.imdbRating);
          movie.imdbVotes = parseInt(omdbMovie.imdbVotes.replace(/,/g, ''));
          movie.metascore = omdbMovie.Metascore ? parseInt(omdbMovie.Metascore, 10) : undefined;

          const rottenTomatoesRating = omdbMovie.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value;
          movie.rottenTomatoesRating = rottenTomatoesRating ? parseInt(rottenTomatoesRating, 10) : undefined;
          movie.usaRating = omdbMovie.Rated !== 'N/A' ? omdbMovie.Rated : undefined;
          movie.directors = omdbMovie.Director.split(', ');
          movie.writers = omdbMovie.Writer.split(', ');
          movie.actors = omdbMovie.Actors.split(', ');
          movie.production = omdbMovie.Production !== 'N/A' ? omdbMovie.Production : undefined;

          if (omdbMovie.Released) {
            const releaseDateWithOffset = new Date(omdbMovie.Released);
            const releaseDate = new Date(releaseDateWithOffset.getTime() - releaseDateWithOffset.getTimezoneOffset() * 60000);
            movie.releaseDate = releaseDate.toISOString();
          }
          movie.countries = omdbMovie.Country.split(', ');
          movie.languages = omdbMovie.Language.split(', ');
          movie.genres = omdbMovie.Genre.split(', ');
          if (patch[movie.title] && typeof patch[movie.title] === 'object') {
            Object.assign(movie, patch[movie.title]);
          }

          if (!sublist && ++pendingWrites % 50 === 0) {
            await scb.writeMovieRankings(movies);
            pendingWrites = 0;
          }
          console.log(` - ${i}/${movies.length}: OK for ${movie.title}`);
        } else {
          console.log(` - ${i}/${movies.length}: ${movie.title} not found in OMDB`);
        }
      }
      i++;
    }

    if (!sublist) {
      await scb.writeMovieRankings(movies);
    }
  } catch (e) {
    if (e.statusCode === 401) {
      console.warn("  SKIPPED: Daily OMDB limit reached :(");
      const missingMovies = movies.filter(r => !r.posterUrl);
      if (missingMovies.length < 100) {
        console.warn(`  Missing movies: ${missingMovies.map(m => m.tconst).join(' ')}`);
        console.warn("  If you're in a hurry you can get them manually at http://www.omdbapi.com/ and put them in omdb_dump.json");
      }
      await scb.writeMovieRankings(movies);
    } else {
      throw e;
    }
  }
}

export function invalidateOMDBData(movie: Movie) {
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

async function readOMDBDump(): Promise<OmdbMovie[]> {
  const dumpObject = await data.readData<Record<string, OmdbMovie>>("omdb_dump.json");
  return Object.values(dumpObject);
}
