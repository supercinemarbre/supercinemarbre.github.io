<template>
  <v-list-item link :to="to">
    <v-list-item-action>
      <v-icon>{{ icon }}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{ label }}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script src="./SidebarLink.ts" lang="ts"></script>
