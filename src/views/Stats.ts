import MoviesPerEpisodeStats from '@/components/stats/MoviesPerEpisodeStats.vue';
import { fetchMovies } from '@/services/api.service';
import { Movie } from '@/types';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    MoviesPerEpisodeStats
  }
})
export default class Stats extends Vue {

  movies: Movie[] = [];

  async created() {
    this.movies = await fetchMovies();
  }

  mounted() {
    window.scrollTo(0, 0);
  }

}
