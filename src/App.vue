<template>
 <v-app id="app">
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list>
        <SidebarLink to="/" icon="mdi-movie" label="Tous les films" />
        <SidebarLink to="/1960" icon="mdi-numeric-6-box-multiple" label="Années 1960" />
        <SidebarLink to="/1970" icon="mdi-numeric-7-box-multiple" label="Années 1970" />
        <SidebarLink to="/1980" icon="mdi-numeric-8-box-multiple" label="Années 1980" />
        <SidebarLink to="/1990" icon="mdi-numeric-9-box-multiple" label="Années 1990" />
        <SidebarLink to="/2000" icon="mdi-numeric-0-box-multiple" label="Années 2000" />
        <SidebarLink to="/2010" icon="mdi-numeric-1-box-multiple" label="Années 2010" />
        <SidebarLink to="/about" icon="mdi-information-outline" label="A propos" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left height="100">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <a id="app-logo" to="/">
          <img src="../public/img/logo.png" title="Super Ciné Marbre" />
        </a>
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-footer app>
      Contribuez à ce projet 
      <a style="margin: 0 5px" href="https://github.com/supercinemarbre/supercinemarbre.github.io"><v-icon>mdi-github-circle</v-icon>{{' '}}sur Github </a> 
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
    this.$vuetify.theme.dark = true;
    this.$vuetify.lang.current = 'fr';
  },
});
</script>
