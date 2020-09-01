import PopularityIMDB from '@/components/PopularityIMDB.vue';
import RatingIMDB from '@/components/RatingIMDB.vue';
import RatingMetacritic from '@/components/RatingMetacritic.vue';
import RatingRT from '@/components/RatingRT.vue';
import Ordinal from '@/components/Ordinal.vue';
import { fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    RatingIMDB,
    RatingRT,
    RatingMetacritic,
    PopularityIMDB,
    Ordinal
  }
})
export default class Home extends Vue {

  currentDecade? = '';
  state: 'loading' | 'loaded' = 'loading';
  allMovies: Movie[] = [];
  search = '';
  sortBy = [];
  sortDesc = [];
  mobileMode = false;

  mounted() {
    this.onResize();
  }

  async created() {
    this.allMovies = await fetchMovies();
    this.state = 'loaded';
    this.onRouteChange();
  }

  onResize() {
    this.mobileMode = window.innerWidth < 800;
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

  get headers() {
    return [
      { text: "Classement", value: "ranking", align: "center" },
      { text: "Poster", value: "posterUrl", align: "center", sortable: false, filterable: false },
      { text: "Titre", value: "scbTitle" },
      { text: "Année", value: "startYear", align: "center" },
      { text: "Notes", value: "imdbRating", sort: (a, b) => (b||0) - (a||0), filterable: false, class: "column-imdb-ranking" },
      { text: "Popularité IMDB", value: "imdbVotes", sort: (a, b) => (b||0) - (a||0), filterable: false },
      { text: "Episode", value: "episode", align: "center" }
    ];
  }

  shortDecade(decade: string) {
    return decade.slice(2) + 's';
  }

}
