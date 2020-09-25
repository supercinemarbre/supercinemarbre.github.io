
import { Component, Prop, Vue } from 'vue-property-decorator';
import TimestampLink from './TimestampLink.vue';

export const GENRE_TRANSLATIONS = {
  Action: 'Action',
  Adventure: 'Aventure',
  Animation: 'Animation',
  Biography: 'Biographie',
  Comedy: 'Comédie',
  Crime: 'Crime',
  Documentary: 'Documentaire',
  Drama: 'Drame',
  Family: 'Familial',
  Fantasy: 'Fantasy',
  History: 'Historique',
  Horror: 'Horreur',
  Music: 'Musique',
  Musical: 'Comédie musicale',
  Mystery: 'Mystère',
  Romance: 'Romance',
  'Sci-Fi': 'Science-fiction',
  Sport: 'Sport',
  Thriller: 'Thriller',
  War: 'Guerre',
  Western: 'Western'
};

@Component({
  components: {
    TimestampLink
  }
})
export default class MoviePoster extends Vue {

  @Prop() genres?: string[];

  get translatedGenres() {
    return (this.genres || [])
      .map(genre => GENRE_TRANSLATIONS[genre])
      .filter(genre => Boolean(genre))
      .join(', ');
  }

}

