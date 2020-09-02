import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class HallOfFame extends Vue {

  mounted() {
    window.scrollTo(0, 0);
  }
  
}
