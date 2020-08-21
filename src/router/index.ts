import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import List from '../views/List.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
    { path: '/', name: 'Tous les films', component: List },
    { path: '/1970', name: 'Anées 1970', component: List, meta: { decade: "1970" } },
    { path: '/1980', name: 'Anées 1980', component: List, meta: { decade: "1980" } },
    { path: '/1990', name: 'Anées 1990', component: List, meta: { decade: "1990" } },
    { path: '/2000', name: 'Anées 2000', component: List, meta: { decade: "2000" } },
    { path: '/2010', name: 'Anées 2010', component: List, meta: { decade: "2010" } }
  /*  {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" / '../views/About.vue')
    }*/
]

const router = new VueRouter({
  routes
})

export default router
