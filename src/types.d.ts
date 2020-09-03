export interface Episode {
  number: number;
  date: string; // ISO
  title: string;
  url: string;
  mp3url: string;
  decade?: string;
}

export interface Movie {

  // ===================== SUPER CINE BATTLE ===================== */

  /**
   * SCB decade
   */
  decade: string;
  /**
   * SCB episode
   */
  episode: number;
  /**
   * Raw title as listed in the raw SCB rankings, for ID purposes only
   */
  scbTitle: string;
  /**
   * Display title (usually title, but can be corrected in case of typos)
   */
  title: string;
  /**
   * SCB ranking in its decade
   */
  ranking: number;
  /**
   * Special handwritten comment to display
   */
  comment?: string;

  // ===================== IMDB ===================== */

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
  runtimeMinutes?: string;
  /**
   * Movie genres, comma-separated (from IMDB)
   */
  genres?: string;

  // ===================== OMDB ===================== */
  
  /**
   * Poster image URL (from OMDB)
   */
  posterUrl?: string;
  /**
   * IMDB rating, out of 10 (from OMDB)
   */
  imdbRating?: number;
  /**
   * IMDB vote count (from OMDB)
   */
  imdbVotes?: number;
  /**
   * Metascore, out of 100 (from OMDB)
   */
  metascore?: number;
  /**
   * Rotten Tomatoes rating, in percents (from OMDB)
   */
  rottenTomatoesRating?: number;
  /**
   * USA age rating (from OMDB)
   */
  usaRating?: string;
  /**
   * Director(s) (from OMDB)
   */
  directors?: string[];
  /**
   * Writer(s), often suffixed by their writing role in parentheses (from OMDB)
   */
  writers?: string[];
  /**
   * Main actor(s) (from OMDB)
   */
  actors?: string[];
  /**
   * Production company (from OMDB)
   */
  production?: string;
  /**
   * Release date in ISO format (from OMDB)
   */
  releaseDate?: string;
  /**
   * Production country (from OMDB)
   */
  country?: string;
  /**
   * Original language (from OMDB)
   */
  language?: string;

  // ===================== TRANSIENT ===================== */
  
  searchString: string;
}
