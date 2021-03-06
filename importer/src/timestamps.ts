import { time } from "console";
import csvParser from "csv-parser";
import * as fs from "fs";
import { isEqual } from "lodash";
import { dataPath, readData } from "./io";
import { readListUrls, readMovieRankings, writeMovieRankings } from "./scb";
import { findMatchingMovies } from "./scb-utils";
import { Movie, MovieID } from "./types";

export type GSheetsPatch = Partial<Movie> & { gsheetsKey: MovieID; forceImport?: boolean; };

interface TimestampInfo {
  Classement: string;
  Films: string;
  Émission: string;
  Timestamp: string;
}

export async function importTimestampsRankingsAndMissingMovies() {
  console.log("Collecting timestamps");

  const decades = Object.keys(await readListUrls());
  const movies = await readMovieRankings();
  const timestampsPatches = await readTimestampsPatches();
  const maxEpisode = getMaxEpisode(movies);
  let count = 0;

  for (const decade of decades) {
    const filePath = dataPath(`timestamps${decade}.csv`);
    const timestampInfos = await parseCSV<TimestampInfo>(filePath);

    timestampInfos.forEach(timestampInfo => {
      if (timestampInfo.Classement.includes("Déjà classé")) {
        return;
      }

      const key: MovieID = { episode: parseInt(timestampInfo.Émission, 10), name: timestampInfo.Films };

      const patch = timestampsPatches.find(p => isEqual(p.gsheetsKey, key));
      let searchKey: MovieID = patch?.id ? patch.id : key;
      const matches = findMatchingMovies(searchKey, movies);

      let movie: Movie;
      if (matches.length === 1) {
        movie = matches[0];
        movie.timestamp = patch?.timestamp ?? timestampToSeconds(timestampInfo.Timestamp);
        movie.ranking = parseInt(timestampInfo.Classement, 10);
      } else if (key.episode > maxEpisode || patch?.forceImport) {
        console.log(` - Adding Ep. ${key.episode} movie "${key.name}"`);
        const movie: Movie = {
          id: key,
          decade,
          title: timestampInfo.Films,
          ranking: parseInt(timestampInfo.Classement, 10),
          timestamp: timestampToSeconds(timestampInfo.Timestamp)
        };
        movies.push(movie);
      }

      if (movie) {
        count++;
        if (patch) {
          delete patch.gsheetsKey;
          delete patch.forceImport;
          Object.assign(matches[0], patch);
        }
      } else {
        console.log(` - Not found : ${timestampInfo.Films} (Ep. ${timestampInfo.Émission})`);
      }
    });
  }

  const moviesWithoutTimestamps = movies.filter(movie => !movie.timestamp);
  if (moviesWithoutTimestamps.length > 0) {
    console.log(`  Movies left without timestamps (${moviesWithoutTimestamps.length}): ${moviesWithoutTimestamps.map(m => m.title)}`);
  } else {
    console.log(`  OK, all ${movies.length} SCB movies have timestamps`);
  }

  await writeMovieRankings(movies);
}

export async function readTimestampsPatches(): Promise<GSheetsPatch[]> {
  const patches = await readData("timestamps_patch.json");
  if (Array.isArray(patches)) {
    return patches;
  } else {
    return Object.values(patches); // XXX array is sometimes parsed as an object
  }
}

function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results));
  })
}

function timestampToSeconds(timestamp: string) {
  const elements = timestamp.split(' ').map(t => t.slice(0, t.length - 1));
  return parseInt(elements[0], 10) * 3600 + parseInt(elements[1], 10) * 60 + parseInt(elements[2], 10);
}

function getMaxEpisode(movies: Movie[]) {
  return movies.map(m => m.id.episode)
    .reduceRight((a, b) => Math.max(a, b));
}