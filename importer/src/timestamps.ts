import csvParser from "csv-parser";
import * as fs from "fs";
import { isEqual } from "lodash";
import { dataPath, readData } from "./io";
import { readListUrls, readMovieRankings, writeMovieRankings } from "./scb";
import { findMatchingMovies } from "./scb-utils";
import { MovieID } from "./types";

export type TimestampPatch = {
  gsheetsKey: MovieID;
  id?: MovieID;
  timestamp?: number;
};

interface TimestampInfo {
  Classement: string;
  Films: string;
  Émission: string;
  Timestamp: string;
}

export async function applyTimestamps() {
  console.log("Collecting timestamps");

  const inputFileSuffixes = Object.keys(await readListUrls());
  const movies = await readMovieRankings();
  const timestampsPatch = await readTimestampsPatches();
  let count = 0;

  for (const inputFileSuffix of inputFileSuffixes) {
    const filePath = dataPath(`timestamps${inputFileSuffix}.csv`);
    const timestampInfos = await parseCSV<TimestampInfo>(filePath);

    timestampInfos.forEach(timestampInfo => {
      const key: MovieID = { episode: parseInt(timestampInfo.Émission, 10), name: timestampInfo.Films };

      const patch = timestampsPatch.find(t => isEqual(t.gsheetsKey, key));
      let searchKey: MovieID = patch?.id ? patch.id : key;
      const matches = findMatchingMovies(searchKey, movies);

      if (matches.length === 1) {
        matches[0].timestamp = patch?.timestamp ?? timestampToSeconds(timestampInfo.Timestamp);
        count++;
      } else {
        console.log(` - Not found : ${timestampInfo.Films}`
          + ` => Ep. ${timestampInfo.Émission}, ${timestampInfo.Timestamp}. Candidates: ${matches.map(m => m.id.name).join(', ') || '(none)'}`)
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

async function readTimestampsPatches(): Promise<TimestampPatch[]> {
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
