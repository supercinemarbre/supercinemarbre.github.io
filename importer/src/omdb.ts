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
  try {
    console.log("Synchronizing rankings with OMDB");

    if (!OMDB_API_KEY) {
      console.log(`
      Cannot synchronize with OMDB, an API key must first be set in the importer data/ directory, in a file called "omdbapikey".
      Get a free key at http://www.omdbapi.com`);
      return;
    }

    const rankings = sublist ?? await scb.readMovieRankings();
    const patch = await scb.readScbPatch();

    let i = 1, pendingWrites = 0;
    for (const ranking of rankings) {
      if (!ranking.imdbRating) {
        const omdbString = await download(`http://www.omdbapi.com/?i=${ranking.tconst}&apikey=${OMDB_API_KEY}`);
        const omdbMovie = JSON.parse(omdbString.toString()) as OmdbMovie;
        if (omdbMovie.Response === "True") {
          Object.keys(omdbMovie).forEach(key => {
            if (omdbMovie[key] === 'N/A') {
              omdbMovie[key] = '';
            }
          });

          ranking.posterUrl = omdbMovie.Poster;
          ranking.imdbRating = parseFloat(omdbMovie.imdbRating);
          ranking.imdbVotes = parseInt(omdbMovie.imdbVotes.replace(/,/g, ''));
          ranking.metascore = omdbMovie.Metascore ? parseInt(omdbMovie.Metascore, 10) : undefined;

          const rottenTomatoesRating = omdbMovie.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value;
          ranking.rottenTomatoesRating = rottenTomatoesRating ? parseInt(rottenTomatoesRating, 10) : undefined;
          ranking.usaRating = omdbMovie.Rated !== 'N/A' ? omdbMovie.Rated : undefined;
          ranking.directors = omdbMovie.Director.split(', ');
          ranking.writers = omdbMovie.Writer.split(', ');
          ranking.actors = omdbMovie.Actors.split(', ');
          ranking.production = omdbMovie.Production !== 'N/A' ? omdbMovie.Production : undefined;

          if (omdbMovie.Released) {
            const releaseDateWithOffset = new Date(omdbMovie.Released);
            const releaseDate = new Date(releaseDateWithOffset.getTime() - releaseDateWithOffset.getTimezoneOffset() * 60000);
            ranking.releaseDate = releaseDate.toISOString();
          }
          ranking.countries = omdbMovie.Country.split(', ');
          ranking.languages = omdbMovie.Language.split(', ');
          ranking.genres = omdbMovie.Genre.split(', ');
          if (patch[ranking.scbTitle] && typeof patch[ranking.scbTitle] === 'object') {
            Object.assign(ranking, patch[ranking.scbTitle]);
          }

          if (!sublist && ++pendingWrites % 50 === 0) {
            await scb.writeMovieRankings(rankings);
            pendingWrites = 0;
          }
          console.log(` - ${i}/${rankings.length}: OK for ${ranking.scbTitle}`);
        } else {
          console.log(` - ${i}/${rankings.length}: ${ranking.scbTitle} not found in OMDB`);
        }
      }
      i++;
    }

    if (!sublist) {
      await scb.writeMovieRankings(rankings);
    }
  } catch (e) {
    if (e.statusCode === 401) {
      console.warn("  SKIPPED: Daily OMDB limit reached :(");
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
