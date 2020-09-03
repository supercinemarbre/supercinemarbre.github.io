import MovieList from '@/components/MovieList.vue';
import { EpisodeMap, fetchEpisodes, fetchMovies, fetchTimestamps } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    MovieList
  }
})
export default class Home extends Vue {

  currentDecade? = '';
  state: 'loading' | 'loaded' = 'loading';
  allMovies: Movie[] = [];
  episodes: EpisodeMap = [];
  search = '';
  sortBy = [];
  sortDesc = [];

  mounted() {
    window.scrollTo(0, 0);
  }

  async created() {
    const [ movies, episodes, timestamps ] = await Promise.all([
      fetchMovies(),
      fetchEpisodes(),
      fetchTimestamps()
    ])

    this.episodes = episodes;
    this.allMovies = movies;
    this.allMovies.forEach(movie => {
      movie.timestamp = timestamps[movie.scbTitle];
      movie.searchString =
        movie.primaryTitle + '|' +
        movie.title + '|' +
        movie.actors?.join('|') + '|' +
        movie.directors?.join('|') +
        movie.startYear + '|' +
        'Episode ' + movie.episode
    })
    this.state = 'loaded';
    this.onRouteChange();
  }
  
  @Watch('$route')
  public onRouteChange() {
    this.currentDecade = this.$route.meta?.decade;
    this.search = '';
    this.sortBy = this.currentDecade ? [] : ['episode'];
    this.sortDesc = this.currentDecade ? [] : ['desc'];

    setTimeout(() => {
      if (this.$route.hash && document.querySelector) {
        const target = document.querySelector(`[name=${this.$route.hash.slice(1)}]`) as HTMLElement;
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: "center" });
        }
      }
    }, 1);
  }

  get movies(): Movie[] {
    if (this.currentDecade) {
      return this.allMovies
        .filter(movie => movie.decade === this.currentDecade)
        .sort((a, b) => a.ranking - b.ranking)
    } else {
      return this.allMovies.sort((a, b) => (b.startYear || 0) - (a.startYear || 0));
    }
  }

  get decadeTitle(): string {
    if (this.currentDecade) {
      return `La liste ultime des années ${this.currentDecade}`;
    }
  }

}
