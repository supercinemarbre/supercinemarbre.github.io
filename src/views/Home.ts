import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import { fetchMovies, Movie } from '@/services/api.service';

@Component({
  components: {
    HelloWorld,
  },
})
export default class Home extends Vue {

  state: 'loading' | 'loaded' = 'loading';
  movies: Movie[] = [];

  async created() {
    this.movies = await fetchMovies();
  }

}
