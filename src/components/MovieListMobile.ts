import Ordinal from '@/components/common/Ordinal.vue';
import PopularityIMDB from '@/components/ratings/PopularityIMDB.vue';
import RatingIMDB from '@/components/ratings/RatingIMDB.vue';
import RatingMetacritic from '@/components/ratings/RatingMetacritic.vue';
import RatingRT from '@/components/ratings/RatingRT.vue';
import { Movie } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {
    RatingIMDB,
    RatingRT,
    RatingMetacritic,
    PopularityIMDB,
    Ordinal
  }
})
export default class MovieListMobile extends Vue {

  @Prop() currentDecade: string | undefined;
  @Prop() state: 'loading' | 'loaded';
  @Prop() movies: Movie[];
  @Prop() search: string;
  @Prop() sortBy: object[];
  @Prop() sortDesc: object[];

  shortDecade(decade: string) {
    return decade.slice(2) + 's';
  }

}
