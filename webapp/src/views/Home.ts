import { fetchTvSchedule } from '@/services/api.service';
import { XmltvSchedule } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import List from './List.vue';

@Component({
  components: {
    List
  }
})
export default class Home extends Vue {

  tvSchedule = {} as XmltvSchedule;
  error?: string;

  async created() {
    const response = await fetchTvSchedule();
    if ("error" in response) {
      this.error = response.error;
      this.tvSchedule = {} as XmltvSchedule;
    } else {
      this.tvSchedule = response;
    }
  }

}
