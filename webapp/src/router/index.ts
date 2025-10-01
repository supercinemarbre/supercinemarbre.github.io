import APropos from 'src/components/APropos.vue'
import Episodes from 'src/components/Episodes.vue'
import List from 'src/components/List.vue'
import Stats from 'src/components/Stats.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Accueil', component: List },
    { path: '/episodes', name: 'Episodes', component: Episodes },
    { path: '/stats', name: 'Statistiques', component: Stats },
    { path: '/1950', name: 'Années 1950', component: List, props: { decade: '1950' } },
    { path: '/1960', name: 'Années 1960', component: List, props: { decade: '1960' } },
    { path: '/1970', name: 'Années 1970', component: List, props: { decade: '1970' } },
    { path: '/1980', name: 'Années 1980', component: List, props: { decade: '1980' } },
    { path: '/1990', name: 'Années 1990', component: List, props: { decade: '1990' } },
    { path: '/2000', name: 'Années 2000', component: List, props: { decade: '2000' } },
    { path: '/2010', name: 'Années 2010', component: List, props: { decade: '2010' } },
    { path: '/about', name: 'A propos', component: APropos }
  ]
})

export default router
