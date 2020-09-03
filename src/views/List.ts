import MovieList from '@/components/MovieList.vue';
import { fetchMovies } from '@/services/api.service';
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
  search = '';
  sortBy = [];
  sortDesc = [];

  mounted() {
    window.scrollTo(0, 0);
  }

  async created() {
    this.allMovies = await fetchMovies();
    this.allMovies.forEach(movie => {
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
