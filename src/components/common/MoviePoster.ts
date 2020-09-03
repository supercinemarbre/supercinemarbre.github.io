import { Movie } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MoviePoster extends Vue {

  @Prop() movie!: Movie;
  
}
