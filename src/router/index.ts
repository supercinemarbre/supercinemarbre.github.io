import APropos from '@/views/APropos.vue'
import HallOfFame from '@/views/HallOfFame.vue'
import List from '@/views/List.vue'
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
    { path: '/', name: 'Tous les films', component: List },
    { path: '/1960', name: 'Années 1960', component: List, meta: { decade: "1960" } },
    { path: '/1970', name: 'Années 1970', component: List, meta: { decade: "1970" } },
    { path: '/1980', name: 'Années 1980', component: List, meta: { decade: "1980" } },
    { path: '/1990', name: 'Années 1990', component: List, meta: { decade: "1990" } },
    { path: '/2000', name: 'Années 2000', component: List, meta: { decade: "2000" } },
    { path: '/2010', name: 'Années 2010', component: List, meta: { decade: "2010" } },
    { path: '/about', name: 'A propos', component: APropos },
    { path: '/halloffame', name: 'A propos', component: HallOfFame }
]

const router = new VueRouter({
  routes
})

export default router
