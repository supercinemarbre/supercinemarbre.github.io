import MovieList from '@/components/MovieList.vue';
import SpoilerFreeComponent from '@/components/spoiler-free/SpoilerFree';
import SpoilerFree from '@/components/spoiler-free/SpoilerFree.vue';
import { EpisodeMap, fetchEpisodes, fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    MovieList,
    SpoilerFree
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

  @Ref() spoilerFree: SpoilerFreeComponent;

  mounted() {
    window.scrollTo(0, 0);
  }

  async created() {
    this.refreshMoviesAndEpisodes();
    this.onRouteChange();
  }

  async refreshMoviesAndEpisodes() {
    this.state = 'loading';

    const [movies, episodes] = await Promise.all([
      fetchMovies(),
      fetchEpisodes()
    ]);

    this.episodes = episodes;
    this.allMovies = movies
      .filter(movie => {
        return !this.spoilerFree.isEnabled()
          || movie.episode <= this.spoilerFree.getLastWatchedEpisode();
      })
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
