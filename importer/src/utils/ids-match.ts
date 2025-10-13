import { MovieID } from "../types";

export function idsMatch(id1: MovieID, id2: MovieID): boolean {
  return id1 && id2 && id1.episode === id2.episode && id1.name === id2.name;
}
