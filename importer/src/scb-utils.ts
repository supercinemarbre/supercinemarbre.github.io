import levenshtein from "fast-levenshtein";
import { isEqual } from "lodash";
import { Movie } from "./types";

export function findMatchingMovies(key: { episode?: number, name: string, }, movies: Movie[]): Movie[] {
  
  // Exact match
  if (key.episode) {
    const exactMatch = movies.find(m => isEqual(key, m.id));
    if (exactMatch) {
      return [exactMatch];
    }
  }

  // Filter by episode
  const episodeFilteredMovies = key.episode
    ? movies.filter(m => m.id.episode === key.episode)
    : movies;

  // Search similar name
  const keyNameLowercase = key.name.toLowerCase();
  const matches: Array<[Movie, number]> = [];
  for (const movie of episodeFilteredMovies) {
    const distance = Math.min(
        levenshtein.get(keyNameLowercase, movie.id.name.toLowerCase()),
        levenshtein.get(keyNameLowercase, movie.primaryTitle.toLowerCase()));
    if (distance < 5 || movie.title.replace(/0-9/g, '').toLowerCase().includes(keyNameLowercase)) {
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
  for (const episode of movies.map(m => m.id.episode)) {
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