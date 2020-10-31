import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false

Vue.filter('date', (isoString: string) => {
  if (isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  } else {
    return '???';
  }
});

Vue.filter('time', (isoString: string) => {
  if (isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  } else {
    return '???';
  }
});

Vue.filter('ordinal', (n: number) => {
  if (n === 1) {
    return n.toString() + 'er';
  } else {
    return n.toString() + 'e';
  }
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app');
