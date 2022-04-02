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
    const distance = levenshtein.get(keyNameLowercase, movie.id.name.toLowerCase());
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
