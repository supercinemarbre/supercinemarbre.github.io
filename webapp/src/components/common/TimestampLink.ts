import { Episode, Movie } from '@/types';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class TimestampLink extends Vue {

  @Prop() episode!: Episode;
  @Prop() movie!: Movie;
  @Prop() textOnly: boolean;
  
}
