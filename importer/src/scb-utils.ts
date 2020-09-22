import levenshtein from "fast-levenshtein";
import { Movie } from "./types";

export function findMatchingMovies(title: string, movies: Movie[]): Movie[] {
  const matches: Array<[Movie, number]> = [];
  for (const movie of movies) {
    const distance = Math.min(
        levenshtein.get(title.toLowerCase(), movie.scbTitle.toLowerCase()),
        levenshtein.get(title.toLowerCase(), movie.primaryTitle.toLowerCase()));
    if (distance < 5 || movie.title.replace(/0-9/g, '').toLowerCase().includes(title.toLowerCase())) {
      matches.push([movie, distance]);
    }
    if (distance === 0) {
      return [movie];
    }
  }
  return matches
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(match => match[0]);
}

export function deduceEpisode(movies: Movie[]): number {
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

export function flatten<T>(arr: T[][]): T[] {
  return [].concat(...arr);
}