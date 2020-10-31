<template>
  <v-list>
    <!-- Icon list: https://iconify.design/icon-sets/mdi/ -->

    <SidebarLink to="/" icon="mdi-movie" label="Accueil" />
    <SidebarLink to="/tv" icon="mdi-television-box" label="Programme TV" />
    <SidebarLink to="/episodes" icon="mdi-headphones-box" label="Épisodes" />
    <SidebarLink to="/stats" icon="mdi-chart-bar" label="Statistiques" />

    <v-divider></v-divider>
    <SidebarLink to="/1960" icon="mdi-earth" label="Années 1960" />
    <SidebarLink to="/1970" icon="mdi-helicopter" label="Années 1970" />
    <SidebarLink to="/1980" icon="mdi-car-hatchback" label="Années 1980" />
    <SidebarLink to="/1990" icon="mdi-firework" label="Années 1990" />
    <SidebarLink to="/2000" icon="mdi-baby" label="Années 2000" />
    <SidebarLink to="/2010" icon="mdi-google-circles" label="Années 2010" />
    
    <v-divider></v-divider>
    <SidebarLink to="/about" icon="mdi-information-outline" label="A propos" />
  </v-list>
</template>

<script src="./Sidebar.ts" lang="ts"></script>
