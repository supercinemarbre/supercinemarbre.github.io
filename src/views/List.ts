import MovieList from '@/components/MovieList.vue';
import { EpisodeMap, fetchEpisodes, fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    MovieList
  }
})
export default class Home extends Vue {

  currentDecade?= '';
  state: 'loading' | 'loaded' = 'loading';
  allMovies: Movie[] = [];
  episodes: EpisodeMap = [];
  search = '';
  sortBy = [];
  sortDesc = [];
  itemsPerPage = 5;

  mounted() {
    window.scrollTo(0, 0);
  }

  async created() {
    const [movies, episodes] = await Promise.all([
      fetchMovies(),
      fetchEpisodes()
    ]);

    this.episodes = episodes;
    this.allMovies = movies
      .map(movie => {
        movie.episode = movie.id.episode;
        movie.searchString =
          movie.primaryTitle + '|' +
          movie.title + '|' +
          movie.actors?.join('|') + '|' +
          movie.directors?.join('|') +
          movie.year + '|' +
          'Episode ' + movie.episode
        return movie;
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
      return this.allMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
  }

  get decadeTitle(): string {
    if (this.currentDecade) {
      return `La liste ultime des années ${this.currentDecade}`;
    }
  }

}
