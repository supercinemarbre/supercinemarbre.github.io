import * as justWatch from './src/justwatch';

(async () => {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: npm run jwsearch "movie name"');
    process.exit(0);
    return;
  }

  const movies = await justWatch.searchMovies(input)

  movies
    .map(m => ({
      title: `${m.title} (${m.original_release_year})`,
      metadata: {
        jwId: m.id,
        jwFullPath: m.full_path
      }
    }))
    .forEach(m => console.log(JSON.stringify(m, null, 2)));

  ;

})();