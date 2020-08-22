import download from "download";
import * as data from "./io";
import * as scb from "./scb";
import { Movie } from "./types";
import { type } from "os";

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
  if (!OMDB_API_KEY) return `
    Cannot synchronize with OMDB, an API key must first be set in the importer root directory, in a file called "omdbapikey".
    Get a free key at http://www.omdbapi.com'
  `;

  console.log("Synchronizing rankings with OMDB");
  const rankings = sublist ?? await scb.readMovieRankings();
  const patch = await scb.readMoviesPatch();

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
        ranking.metascore = parseInt(omdbMovie.Metascore, 10);

        const rottenTomatoesRating = omdbMovie.Ratings.find(r => r.Source === "Rotten Tomatoes")?.Value;
        ranking.rottenTomatoesRating = rottenTomatoesRating ? parseInt(rottenTomatoesRating, 10) : undefined;
        ranking.usaRating = omdbMovie.Rated;
        ranking.directors = omdbMovie.Actors.split(', ');
        ranking.writers = omdbMovie.Actors.split(', ');
        ranking.actors = omdbMovie.Actors.split(', ');
        ranking.production = omdbMovie.Production;

        if (omdbMovie.Released) {
          const releaseDateWithOffset = new Date(omdbMovie.Released);
          const releaseDate = new Date(releaseDateWithOffset.getTime() - releaseDateWithOffset.getTimezoneOffset() * 60000);
          ranking.releaseDate = releaseDate.toISOString();
        }
        ranking.country = omdbMovie.Country;
        ranking.language = omdbMovie.Language;
        if (patch[ranking.tconst] && typeof patch[ranking.tconst] === 'object') {
          Object.assign(ranking, patch[ranking.tconst]);
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
}
