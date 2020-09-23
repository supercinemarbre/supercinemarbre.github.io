import { Episode, Movie } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import TimestampLink from './TimestampLink.vue';

@Component({
  components: {
    TimestampLink
  }
})
export default class MoviePoster extends Vue {

  @Prop() episode!: Episode;
  @Prop() movie!: Movie;

  ellipsis(text: string, max: number) {
    if (text.length > max) {
      let result = '';
      for (const word of text.split(' ')) {
        if (result.length + word.length < max - 5) {
          result += ' ' + word;
        } else {
          return result + '[...]';
        }
      }
    }
    return text;
  }

  timestamp(time: number) {
    if (time) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor(time / 60) % 60;
      const seconds = time % 60;

      const minSec = `${this.leftPad(minutes)}:${this.leftPad(seconds)}`;
      if (hours > 0) {
        return `${hours}:${minSec}`;
      }
      return minSec;
    } else {
      return '';
    }
  }
    
  private leftPad(number: number) {
    let result = number.toString();
    while (result.length < 2) {
      result = '0' + result;
    }
    return result;
  }
}
