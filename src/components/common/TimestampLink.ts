import { Episode, Movie } from '@/types';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class TimestampLink extends Vue {

  @Prop() episodes!: Episode[];
  @Prop() movie!: Movie;
  
}
