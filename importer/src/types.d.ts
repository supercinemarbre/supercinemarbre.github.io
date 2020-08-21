export interface Movie {
  /**
   * SCB decade
   */
  decade: string;
  /**
   * SCB episode
   */
  episode: number;
  /**
   * Title as listed in the raw SCB rankings
   */
  scbTitle: string;
  /**
   * SCB ranking in its decade
   */
  ranking: number;
  /**
   * Special handwritten comment to display
   */
  comment?: string;
  /**
   * IMDB movie ID
   */
  tconst?: string;
  /**
   * English title (from IMDB)
   */
  primaryTitle?: string;
  /**
   * Release title in original language (from IMDB)
   */
  originalTitle?: string;
  /**
   * Release year (from IMDB)
   */
  startYear?: number;
  /**
   * Movie duration in minutes (from IMDB)
   */
  runtimeMinutes?: number;
  /**
   * Movie genres, comma-separated (from IMDB)
   */
  genres?: string;
}
