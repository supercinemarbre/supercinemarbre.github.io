import { Movie } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import MovieListDesktop from './MovieListDesktop.vue';
import MovieListMobile from './MovieListMobile.vue';

@Component({
  components: {
    MovieListDesktop,
    MovieListMobile
  }
})
export default class MovieList extends Vue {

  @Prop() currentDecade: string | undefined;
  @Prop() state: 'loading' | 'loaded';
  @Prop() movies: Movie[];
  @Prop() search: string;
  @Prop() sortBy: object[];
  @Prop() sortDesc: object[];

  mobileMode = false;

  mounted() {
    this.onResize();
  }

  onResize() {
    this.mobileMode = window.innerWidth < 991;
  }

}
