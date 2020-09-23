import MoviePoster from '@/components/common/MoviePoster.vue';
import TimestampLink from '@/components/common/TimestampLink.vue';
import { EpisodeMap, fetchEpisodes, fetchMovies } from '@/services/api.service';
import { Episode, Movie } from '@/types';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    MoviePoster,
    TimestampLink
  }
})
export default class Home extends Vue {

  state: 'loading' | 'loaded' = 'loading';
  allMovies: Movie[] = [];
  episodeMap: EpisodeMap = {};
  episodes: Episode[] = [];
  search = '';

  mounted() {
    window.scrollTo(0, 0);
  }

  async created() {
    const [movies, episodeMap] = await Promise.all([
      fetchMovies(),
      fetchEpisodes()
    ])

    this.episodeMap = episodeMap;
    this.episodes = Object.values(this.episodeMap)
      .sort((e1, e2) => e2.number - e1.number);
    this.episodes.forEach(episode => {
      episode.searchString =
        episode.title + '|' +
        this.leftPad(episode.number, '0', 3);
    });

    this.allMovies = movies
      .map(movie => {
        movie.episode = movie.id.episode;
        return movie;
      });
    this.state = 'loaded';
  }

  episodeMovies(episodeNumber: number) {
    return this.allMovies
      .filter(m => m.episode === episodeNumber)
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return a.timestamp - b.timestamp;
        }
        return b.timestamp || -a.timestamp;
      });
  }

  leftPad(number: number, char: string, size: number) {
    let result = number.toString();
    while (result.length < size) {
      result = char + result;
    }
    return result;
  }

  timestamp(time: number) {
    if (time) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor(time / 60) % 60;
      const seconds = time % 60;

      const minSec = `${this.leftPad(minutes, '0', 2)}:${this.leftPad(seconds, '0', 2)}`;
      if (hours > 0) {
        return `${hours}:${minSec}`;
      }
      return minSec;
    } else {
      return '';
    }
  }
}
