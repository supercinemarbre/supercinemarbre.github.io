import { Movie } from "./types";
import * as scb from "./scb";
import { readFileSync } from "fs";
import { resolve } from "path";
import download from "download";

const OMDB_API_KEY = readApiKey();

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

export async function synchronizeWithOMDB(rankings: Movie[]) {
  if (!OMDB_API_KEY) return `
    Cannot synchronize with OMDB, an API key must first be set in the importer root directory, in a file called "omdbapikey".
    Get a free key at http://www.omdbapi.com'
  `;

  const patch = await scb.readMoviesPatch();

  let i = 0;
  for (const ranking of rankings) {
    if (!ranking.imdbRating) {
      const omdbString = await download(`http://www.omdbapi.com/?i=${ranking.tconst}&apikey=${OMDB_API_KEY}`);
      const omdbMovie = JSON.parse(omdbString.toString()) as OmdbMovie;
      if (omdbMovie.Response === "True") {
        ranking.imdbRating = parseFloat(omdbMovie.imdbRating);
        ranking.imdbVotes = parseInt(omdbMovie.imdbVotes.replace(/,/g, ''));
        ranking.directors = omdbMovie.Actors.split(', ');
        ranking.writers = omdbMovie.Actors.split(', ');
        ranking.actors = omdbMovie.Actors.split(', ');
        // await scb.writeMovieRankings(rankings);
        console.log(`${i}/${rankings.length}: OK for ${ranking.scbTitle}`);
      } else {
        console.log(`${i}/${rankings.length}: ${ranking.scbTitle} not found in OMDB`);
      }
    }
    i++;
  }

  // await scb.writeMovieRankings(rankings);
}

function readApiKey() {
  try {
    return readFileSync(resolve(__dirname, "../omdbapikey")).toString().trim();
  } catch (e) {
    return undefined;
  }
}