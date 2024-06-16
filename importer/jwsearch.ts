import * as justWatch from './src/justwatch';

(async () => {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: npm run jwsearch "movie name"');
    process.exit(0);
  }

  const movies = await justWatch.searchMovies(input)

  movies
    .map(m => ({
      title: `${m.content.title} (${m.content.originalReleaseYear})`,
      metadata: {
        jwId: m.id,
        jwFullPath: m.content.fullPath
      }
    }))
    .forEach(m => console.log(JSON.stringify(m, null, 2)));

})();