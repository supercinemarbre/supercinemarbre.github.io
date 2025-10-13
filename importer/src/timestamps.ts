import csvParser from "csv-parser";
import * as fs from "fs";
import { dataPath } from "./io";
import * as patch from "./movie-patch";
import { readListUrls, readMovieRankings, writeMovieRankings } from "./scb";
import { findMatchingMovies } from "./scb-matcher";
import { Movie, MovieID } from "./types";

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
  const maxEpisode = getMaxEpisode(movies);

  for (const decade of decades) {
    const filePath = dataPath(`timestamps${decade}.csv`);
    const timestampInfos = await parseCSV<TimestampInfo>(filePath);

    for (const timestampInfo of timestampInfos) {
      if (timestampInfo.Classement.includes("Déjà classé")) {
        return;
      }

      const gsheetsKey: MovieID = { episode: parseInt(timestampInfo.Émission, 10), name: timestampInfo.Films };
      const id = await patch.gsheetsKeyToId(gsheetsKey);
      const matches = findMatchingMovies(id, movies);

      let movie: Movie;
      if (matches.length === 1) {
        movie = matches[0];
        movie.timestamp = movie?.timestamp ?? timestampToSeconds(timestampInfo.Timestamp);
        movie.ranking =  movie.ranking ?? parseInt(timestampInfo.Classement, 10);
      } else if (id.episode > maxEpisode || await patch.mustForceImport(id)) {
        console.log(` - Adding Ep. ${id.episode} movie "${id.name}"`);
        const movie: Movie = {
          id,
          decade,
          title: timestampInfo.Films,
          ranking: parseInt(timestampInfo.Classement, 10),
          timestamp: timestampToSeconds(timestampInfo.Timestamp)
        };
        movies.push(movie);
      }

      if (!movie) {
        console.log(` - Unknown movie : ${timestampInfo.Films} (Ep. ${timestampInfo.Émission})`);
      }
    }
  }

  const moviesWithoutTimestamps = movies.filter(movie => !movie.timestamp);
  if (moviesWithoutTimestamps.length > 0) {
    console.log(`  Movies left without timestamps (${moviesWithoutTimestamps.length}): ${moviesWithoutTimestamps.map(m => m.title)}`);
  } else {
    console.log(`  OK, all ${movies.length} SCB movies have timestamps`);
  }

  await writeMovieRankings(movies);
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