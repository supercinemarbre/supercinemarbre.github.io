<template>
  <v-lazy>
    <div>
      <v-progress-linear
        :value="percentage"
        color="#BBBBBB"
        height="8"
      ></v-progress-linear>
      <div class="legend">{{ votesLabel }}</div>
    </div>
  </v-lazy>
</template>

<script src="./PopularityIMDB.ts" lang="ts"></script>

<style lang="scss" scoped>
.legend {
  padding-top: 2px;
  color: #888888;
  font-size: 90%;
}
</style>
