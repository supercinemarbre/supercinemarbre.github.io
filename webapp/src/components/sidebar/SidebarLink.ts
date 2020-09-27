import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class SidebarLink extends Vue {

  @Prop() to!: string;
  @Prop() icon!: string;
  @Prop() label!: string;
  
}
