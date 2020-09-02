import MostPresentDirectors from '@/components/halloffame/MostPresentDirectors.vue';
import MovieList from '@/components/MovieList.vue';
import { fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    MostPresentDirectors,
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
