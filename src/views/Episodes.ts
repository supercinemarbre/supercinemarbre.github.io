import MoviePoster from '@/components/common/MoviePoster.vue';
import { EpisodeMap, fetchEpisodes, fetchMovies } from '@/services/api.service';
import { Episode, Movie } from '@/types';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    MoviePoster
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
    const [ movies, episodeMap ] = await Promise.all([
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

    this.allMovies = movies;
    this.state = 'loaded';
  }

  episodeMovies(episodeNumber: number) {
    return this.allMovies.filter(m => m.episode === episodeNumber);
  }

  leftPad(number: number, char: string, size: number) {
    let result = number.toString();
    while (result.length < size) {
      result = char + result;
    }
    return result;
  }
  
}
