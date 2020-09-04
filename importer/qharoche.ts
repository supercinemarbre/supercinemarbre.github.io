import * as scb from "./src/scb";
import * as fs from "fs";
import * as path from "path";
import levenshtein from "fast-levenshtein";
import { Movie } from "./src/types";

const INPUT_PATH = path.resolve(__dirname, "qharoche.txt");

interface TimestampInfo {
  timestamp: number,
  matchingMovies: Movie[]
  rawTitle: string;
}

(async () => {

  const movies = await scb.readMovieRankings();

  fs.watchFile(INPUT_PATH, async (current) => {
    if (current.isFile()) {
      try {
        const input = fs.readFileSync(INPUT_PATH).toString();
        const output = await runQHarocheParser(movies, input);
        fs.writeFileSync(INPUT_PATH, input + '\n' + JSON.stringify(output, null, 2));
      } catch (e) {
        console.error(e);
      }
    }
  });

  console.log("Parser ready, copy a YouTube comment into qharoche.txt and save the file.");
})();

function runQHarocheParser(movies: Movie[], input: string) {
  const timestampInfos = input.split('\n')
    .map(token => token.trim())
    .filter(line => Boolean(line))
    .map(line => line.trim().split(': ').map(token => token.trim()))
    .map(([timestampString, title]: [string, string]) => {
      const timestamp = parseTimestampString(timestampString);
      const matchingMovies = findMatchingMovies(title, movies);
      return {
        timestamp,
        matchingMovies,
        rawTitle: title
      }
    });

  const episode = deduceEpisode(flatten(timestampInfos.map(l => l.matchingMovies)));

  return buildTimestampMap(timestampInfos, episode);
}

function buildTimestampMap(timestampInfos: TimestampInfo[], episode: number) {
  const map: Record<string, number> = {};
  map[`____ EPISODE ${episode} ____`] = 0;
  for (const timestampInfo of timestampInfos) {
    const movie = timestampInfo.matchingMovies.find(movie => movie.episode === episode);
    if (movie) {
      map[movie.scbTitle] = timestampInfo.timestamp;
    } else {
      map[timestampInfo.rawTitle + '[?]'] = timestampInfo.timestamp;
      console.log(`Not found: ${timestampInfo.rawTitle} (timestamp: ${timestampInfo.timestamp})`);
      console.log(`  (possible candidates: ${timestampInfo.matchingMovies.map(m => m.scbTitle).join(', ') || 'none'})`)
    }
  }
  return map;
}

function parseTimestampString(timestampString: string): number {
  const TIME_MULTIPLIERS = [1, 60, 3600];
  const timeElements = timestampString.split(':');
  return timeElements.map((el, index) => parseInt(el) * TIME_MULTIPLIERS[timeElements.length - 1 - index])
    .reduce((a, b) => a + b, 0);
}

function findMatchingMovies(title: string, movies: Movie[]): Movie[] {
  const matches: Array<[Movie, number]> = [];
  for (const movie of movies) {
    const distance = Math.min(levenshtein.get(title, movie.scbTitle), levenshtein.get(title, movie.primaryTitle));
    if (distance < 5 || movie.title.replace(/0-9/g, '').toLowerCase().includes(title.toLowerCase())) {
      matches.push([movie, distance]);
    }
  }
  return matches
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(match => match[0]);
}

function flatten<T>(arr: T[][]): T[] {
  return [].concat(...arr);
}

function deduceEpisode(movies: Movie[]): number {
  const countByEpisode = {};
  for (const episode of movies.map(m => m.episode)) {
    countByEpisode[episode] = countByEpisode[episode] ? countByEpisode[episode] + 1 : 1;
  }

  let bestEpisode = Object.keys(countByEpisode)[0];
  for (const episode of Object.keys(countByEpisode)) {
    if (countByEpisode[episode] > countByEpisode[bestEpisode]) {
      bestEpisode = episode;
    }
  }
  return parseInt(bestEpisode, 10);
}