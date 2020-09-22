import csvParser from "csv-parser";
import * as fs from "fs";
import * as path from "path";
import { readData, writeData } from "./src/io";
import { readMovieRankings } from "./src/scb";
import { findMatchingMovies } from "./src/scb-utils";


(async () => {
  console.log("Collecting timestamps")

  const inputFileSuffixes = [1960, 1970, 1980, 1990, 2000, 2010];
  const movies = await readMovieRankings();
  const timestampsPatch = await readTimestampsPatch();

  const output = {};

  for (const inputFileSuffix of inputFileSuffixes) {
    const filePath = path.resolve(__dirname, `data/timestamps${inputFileSuffix}.csv`);
    const timestampInfos = await parseCSV<TimestampInfo>(filePath);
    timestampInfos.forEach(timestampInfo => {
      if (timestampsPatch[timestampInfo.Films]) {
        timestampInfo.Films = timestampsPatch[timestampInfo.Films];
      }

      const matches = findMatchingMovies(timestampInfo.Films, movies);
      if (matches.length === 1) {
        output[matches[0].scbTitle] = timestampToSeconds(timestampInfo.Timestamp);
      } else {
        console.log(` - Not found : ${timestampInfo.Films} (ep. ${timestampInfo.Émission}) => ${timestampInfo.Timestamp} (${matches.map(m => m.scbTitle).join(', ') || '???????'})`)
      }
    });
  }

  console.log(`Compiled ${Object.keys(output).length}/${movies.length} timestamps`);
  await writeTimestamps(output);

})();


interface TimestampInfo {
  Classement: string;
  Films: string;
  Émission: string;
  Timestamp: string;
  Lien: string;
}

function readTimestampsPatch(): Promise<Record<string, string>> {
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
  return parseInt(elements[0], 10) *3600 +  parseInt(elements[1], 10) * 60 + parseInt(elements[2], 10);
}
