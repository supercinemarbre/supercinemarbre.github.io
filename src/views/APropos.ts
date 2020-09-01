import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class APropos extends Vue {

  mounted() {
    window.scrollTo(0, 0);
  }
  
}
