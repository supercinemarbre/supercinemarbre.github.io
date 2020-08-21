<template>
 <v-app id="app">
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list>
        <SidebarLink to="/" icon="mdi-view-dashboard" label="Tous les films" />
        <SidebarLink to="/1970" icon="mdi-view-dashboard" label="Années 1970" />
        <SidebarLink to="/1980" icon="mdi-view-dashboard" label="Années 1980" />
        <SidebarLink to="/1990" icon="mdi-view-dashboard" label="Années 1990" />
        <SidebarLink to="/2000" icon="mdi-view-dashboard" label="Années 2000" />
        <SidebarLink to="/2010" icon="mdi-view-dashboard" label="Années 2010" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Super Ciné Marbre</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-footer app>
      <span>Utilise des informations de <a href="http://www.imdb.com">IMDb</a> avec leur permission. Utilise des données de <a href="http://www.omdbapi.com/">OMDB</a> sous licence CC BY-NC 4.0.</span>
    </v-footer>
  </v-app>
</template>

<style lang="scss">
@import '@/styles/app.scss';
</style>

<script lang="ts">
import Vue from 'vue';
import SidebarLink from './components/SidebarLink.vue';

export default Vue.extend({
  components: {
    SidebarLink
  },
  data: () => ({
    drawer: null,
  }),
  created () {
    this.$vuetify.theme.dark = true
  },
});
</script>
