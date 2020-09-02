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
export default class MovieListDesktop extends Vue {

  @Prop() currentDecade: string | undefined;
  @Prop() state: 'loading' | 'loaded';
  @Prop() movies: Movie[];
  @Prop() search: string;
  @Prop() sortBy: object[];
  @Prop() sortDesc: object[];

  shortDecade(decade: string) {
    return decade.slice(2) + 's';
  }

  get headers() {
    return [
      { text: "Classement", value: "ranking", align: "center", filterable: false },
      { text: "Poster", value: "posterUrl", align: "center", sortable: false, filterable: false },
      { text: "Titre", value: "searchString" },
      { text: "Année", value: "startYear", align: "center", filterable: false },
      { text: "Notes", value: "imdbRating", sort: (a, b) => (b||0) - (a||0), filterable: false, class: "column-imdb-ranking" },
      { text: "Popularité IMDB", value: "imdbVotes", sort: (a, b) => (b||0) - (a||0), filterable: false },
      { text: "Episode", value: "episode", align: "center", filterable: false }
    ];
  }

}
