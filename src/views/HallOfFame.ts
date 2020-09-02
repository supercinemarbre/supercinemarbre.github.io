import { Component, Vue } from 'vue-property-decorator';
import MovieList from '@/components/MovieList.vue';
import { Movie } from '@/types';
import { fetchMovies } from '@/services/api.service';

@Component({
  components: {
    MovieList
  }
})
export default class HallOfFame extends Vue {

  allMovies: Movie[];
  state: 'loading' | 'loaded' = 'loading';
  search = '';
  sortBy = [];
  sortDesc = [];

  async created() {
    this.allMovies = (await fetchMovies())
      .filter(movie => movie.directors.includes('Steven Spielberg'));
    this.state = 'loaded';
  }

  mounted() {
    window.scrollTo(0, 0);
  }
  
}
