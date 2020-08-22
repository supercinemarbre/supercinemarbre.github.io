<template>
  <span v-if="isValid">
    {{ ratingLabel }}
    <img v-if="tomatometer === 'fresh'" src="../../public/img/rt-fresh.png" />
    <img v-if="tomatometer === 'rotten'" src="../../public/img/rt-rotten.png" />
  </span>
</template>

<script src="./RatingRT.ts" lang="ts"></script>

<style lang="scss" scoped>
img {
  margin-top: -4px;
  margin-left: 4px;
  vertical-align: middle;
  height: 26px;
}
</style>
