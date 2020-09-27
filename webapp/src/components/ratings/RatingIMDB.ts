import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class RatingIMDB extends Vue {

  @Prop() rating?: number;

  get isValid() {
    return typeof this.rating === 'number';
  }
  
  get ratingLabel() {
    if (this.isValid) {
      return this.rating.toFixed(1);
    }
    return '';
  }

}
