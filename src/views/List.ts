import PopularityIMDB from '@/components/PopularityIMDB.vue';
import RatingIMDB from '@/components/RatingIMDB.vue';
import RatingMetacritic from '@/components/RatingMetacritic.vue';
import RatingRT from '@/components/RatingRT.vue';
import { fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
    RatingIMDB,
    RatingRT,
    RatingMetacritic,
    PopularityIMDB
  }
})
export default class Home extends Vue {

  currentDecade? = '';
  state: 'loading' | 'loaded' = 'loading';
  allMovies: Movie[] = [];
  search = '';
  sortBy = [];
  sortDesc = [];

  async created() {
    this.allMovies = await fetchMovies();
    this.state = 'loaded';
    this.onRouteChange();
  }

  @Watch('$route')
  public onRouteChange() {
    this.currentDecade = this.$route.meta?.decade;
    this.search = '';
    this.sortBy = this.currentDecade ? [] : ['episode'];
    this.sortDesc = this.currentDecade ? [] : ['desc'];
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
    let headers = [];
    if (this.currentDecade) {
      headers.push({ text: "Classement", value: "ranking", align: "center" });
    }
    headers = headers.concat([
      { text: "Poster", value: "posterUrl", align: "center", sortable: false, filterable: false },
      { text: "Titre", value: "primaryTitle" },
      { text: "Notes", value: "imdbRating", sort: (a, b) => (b||0) - (a||0), filterable: false },
      { text: "Popularité IMDB", value: "imdbVotes", sort: (a, b) => (b||0) - (a||0), filterable: false },
      { text: "Nom Super Ciné Battle", value: "scbTitle" },
      { text: "Année", value: "startYear", align: "center" },
      { text: "Episode", value: "episode", align: "center" }
    ])
    if (!this.currentDecade) {
      headers.push({ text: "Classement", value: "ranking", align: "center" });
    }
    return headers;
  }

}
