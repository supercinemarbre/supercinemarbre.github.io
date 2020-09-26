<template>
  <div class="spoiler-free">
    <v-switch
      v-model="settings.enabled"
      label="Mode sans spoilers"
      style="margin-right: 10px"
    ></v-switch>
    <v-text-field
      v-if="settings.enabled"
      v-model="settings.lastWatched"
      label="Dernier ép. vu"
      :suffix="'sur ' + maxEpisode"
      outlined
      style="width: 200px"
    ></v-text-field>
  </div>
</template>

<script src="./SpoilerFree.ts" lang="ts"></script>

<style lang="scss" scoped>
.spoiler-free {
  width: 100%;
  text-align: right;

  > div {
    display: inline-block;
  }
}
</style>