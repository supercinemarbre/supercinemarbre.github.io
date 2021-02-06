import { Movie } from '@/types';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class RatingRT extends Vue {

  @Prop() movie?: Movie;

}
