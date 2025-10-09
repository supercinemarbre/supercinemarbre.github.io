<script setup lang="ts">
import Footer from 'src/_ui/Footer.vue'
import Sidebar from 'src/_ui/Sidebar.vue'
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Header from './_ui/Header.vue'

const showDrawer = ref(true)
</script>

<template>
  <v-layout>
    <v-app-bar id="app-bar">
      <v-app-bar-nav-icon @click.stop="showDrawer = !showDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title>
        <Header></Header>
      </v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer id="nav" v-model="showDrawer">
      <Sidebar></Sidebar>

      <template v-slot:append>
        <Footer></Footer>
      </template>
    </v-navigation-drawer>

    <v-main id="main">
      <v-container fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-layout>
</template>

<style lang="scss" scoped>
#app-bar {
  height: var(--app-bar-height);
  background-image: url('/img/bgmarbre.jpg');
  padding: 20px;
}

#main {
  --v-layout-top: var(--app-bar-height) !important;
}

#nav {
  top: var(--app-bar-height) !important;
  height: calc(100% - var(--app-bar-height)) !important;
}
</style>
