<template>
  <span v-if="isValid">
    <img src="../../public/img/imdb.png" />
    {{ ratingLabel }}
  </span>
</template>

<script src="./RatingIMDB.ts" lang="ts"></script>

<style lang="scss" scoped>
img {
  margin-top: -4px;
  margin-right: 2px;
  vertical-align: middle;
  height: 24px;
}
</style>
