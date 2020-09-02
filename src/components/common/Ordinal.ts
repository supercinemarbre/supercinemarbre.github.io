import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Ordinal extends Vue {

  @Prop() value?: number;
  
}
