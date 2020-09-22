import csvParser from "csv-parser";
import * as fs from "fs";
import { dataPath, readData, writeData } from "./io";
import { readListUrls, readMovieRankings } from "./scb";
import { findMatchingMovies } from "./scb-utils";
import { Movie } from "./types";

interface TimestampInfo {
  Classement: string;
  Films: string;
  Émission: string;
  Timestamp: string;
}

export async function collectTimestamps() {
  console.log("Collecting timestamps");

  const inputFileSuffixes = Object.keys(await readListUrls());
  const movies = await readMovieRankings();
  const timestampsPatch = await readTimestampsPatch();
  const maxEpisode = getMaxEpisode(movies);

  const output = {};

  for (const inputFileSuffix of inputFileSuffixes) {
    const filePath = dataPath(`timestamps${inputFileSuffix}.csv`);
    const timestampInfos = await parseCSV<TimestampInfo>(filePath);

    timestampInfos.forEach(timestampInfo => {
      if (parseInt(timestampInfo.Émission, 10) <= maxEpisode) {
        const patch = timestampsPatch[timestampInfo.Films];
        if (timestampsPatch[timestampInfo.Films]) {
          if (typeof patch === "string") {
            timestampInfo.Films = timestampsPatch[timestampInfo.Films];
          } else {
            timestampInfo.Films = patch.scbTitle ?? timestampInfo.Films;
          }
        }

        const matches = findMatchingMovies(timestampInfo.Films, movies);
        if (matches.length === 1) {
          output[matches[0].scbTitle] = timestampToSeconds(timestampInfo.Timestamp);
          if (typeof patch === "object") {
            output[matches[0].scbTitle] = patch.timestamp ?? output[matches[0].scbTitle];
          }
        } else {
          console.log(` - Not found : ${timestampInfo.Films}\n`
            + `    => Ep. ${timestampInfo.Émission}, ${timestampInfo.Timestamp}. Candidates: ${matches.map(m => m.scbTitle).join(', ') || '(none)'}`)
        }
      }
    });
  }

  console.log(`  Collected ${Object.keys(output).length}/${movies.length} timestamps`);
  await writeTimestamps(output);
}

function readTimestampsPatch(): Promise<Record<string, any>> {
  return readData("timestamps_patch.json");
}

function writeTimestamps(timestamps: Record<string, string>): Promise<void> {
  return writeData("../../public/scb_timestamps.json", timestamps);
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
  return movies.map(m => m.episode)
    .reduce((a, b) => Math.max(a, b));
}