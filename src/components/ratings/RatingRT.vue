<template>
  <span v-if="isValid">
    <img v-if="tomatometer === 'fresh'" src="../../../public/img/rt-fresh.png" />
    <img v-if="tomatometer === 'rotten'" src="../../../public/img/rt-rotten.png" />
    {{ ratingLabel }}
  </span>
</template>

<script src="./RatingRT.ts" lang="ts"></script>

<style lang="scss" scoped>
img {
  margin-top: -4px;
  margin-right: -1px;
  vertical-align: middle;
  height: 18px;
}
</style>
