import { fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Home extends Vue {

  currentDecade?: string = '';
  state: 'loading' | 'loaded' = 'loading';
  allMovies: Movies[] = [];

  async created() {
    this.allMovies = await fetchMovies();
    this.state = 'loaded';
  }

  @Watch('$route')
  public onRouteChange() {
    this.currentDecade = this.$route.meta?.decade;
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

  get title(): string {
    if (!this.currentDecade) {
      return "Tous les films classés";
    } else {
      return `La liste ultime des années ${this.currentDecade}`;
    }
  }

}
