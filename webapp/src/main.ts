import { createApp } from 'vue'
import App from './App.vue'
import router from './config/router'
import { vuetify } from './config/vuetify'

import './_ui/styles/main.css'

const app = createApp(App)
app.config.globalProperties.window = window

app.use(router)
app.use(vuetify)

app.mount('#app')
